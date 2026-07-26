-- Add the members table to the real-time publication so that changes to a
-- member's row (e.g. admin granting/revoking can_plan_content) are pushed
-- to the client immediately via Supabase real-time subscriptions.
--
-- This lets planners see their new menu items without logging out and back in.
--
-- Run this in the Supabase SQL editor:
alter publication supabase_realtime add table public.members;
