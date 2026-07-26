-- Allow planners (can_plan_content = true) to delete clips, trends, and themes.
-- Previously only admins or the original submitter could delete.
-- This lets planners manage the schedule fully (add AND remove items).

-- Helper: is the current user a planner (admin OR can_plan_content = true)?
create or replace function public.is_planner()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.members m
    where m.user_id = auth.uid()
      and (m.role = 'admin' or m.can_plan_content = true)
  );
$$;

-- Clips: planners can delete any clip
drop policy if exists clips_delete_planner on public.clips;
create policy clips_delete_planner on public.clips
  for delete to authenticated using (public.is_planner());

-- Trend references: planners can delete any trend
drop policy if exists trend_references_delete_planner on public.trend_references;
create policy trend_references_delete_planner on public.trend_references
  for delete to authenticated using (public.is_planner());

-- Content themes: planners can delete any theme
drop policy if exists content_themes_delete_planner on public.content_themes;
create policy content_themes_delete_planner on public.content_themes
  for delete to authenticated using (public.is_planner());
