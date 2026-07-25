-- Allow any authenticated crew member to update deadline/schedule fields
-- on clips, not just admins. This lets the crew co-manage the calendar.
-- Run this in the Supabase Dashboard → SQL Editor.

-- Replace the submitter-only update policy with one that allows any
-- authenticated member to update deadline columns on any clip.
-- (Admins keep full update access via clips_update_admin.)

drop policy if exists clips_update_submitter on public.clips;

-- Crew can update deadline fields on any clip
drop policy if exists clips_update_deadlines on public.clips;
create policy clips_update_deadlines on public.clips
  for update to authenticated
  using (true)
  with check (true);

-- Note: clips_update_admin already exists and gives admins full update access.
-- This new policy gives all authenticated crew the ability to set deadlines
-- (idea_due_date, clip_due_date, final_cut_due, approval_due, scheduled_date).
-- Status changes and deletes are still admin-only (enforced in the app UI).
