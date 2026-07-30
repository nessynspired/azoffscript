-- Add recipe JSONB column to clips table
-- This stores the full production pack (recipe) that a planner builds
-- for a clip — goal, creator task, prompt, video parts, recording
-- instructions, admin editing recipe, etc.
--
-- The planner picks a Shot Recipe / Recording Style / Transition from
-- dropdowns (name + difficulty only — no library IP exposed) and the
-- fields auto-fill. She can then edit everything manually.
--
-- The caption package (caption, comment prompt, search terms, hashtags)
-- is NOT stored here — that stays admin-only via ClipEditor/production_notes.
--
-- Structure stored in recipe:
-- {
--   "shotRecipeId": "recipe_friend_or_follower_b",
--   "recordingStyleId": "reaction_style",
--   "transitionId": "object_hit",
--   "goal": "Viewers should debate...",
--   "creatorTask": "Record your honest reaction...",
--   "prompt": "She watches every story...",
--   "exampleResponse": "Guilty. That's not a friend...",
--   "finalVideoFlow": ["Opening hook...", "Scenario appears...", ...],
--   "part1Start": { "label": "Start Transition — Object Hit", "instructions": ["...","..."] },
--   "part2Content": { "label": "Your Content", "instructions": ["...","..."] },
--   "part3End": { "label": "End Transition — Object Hit", "instructions": ["...","..."] },
--   "beforeRecording": ["Vertical video", "Clear audio", ...],
--   "recordSteps": ["Start your opening transition", ...],
--   "submissionRules": ["Send one video only", "Raw clip", ...],
--   "editStyle": "Fast-cut reactions",
--   "adminOrder": ["Question screen", "Transition into Person 1", ...],
--   "adminNotes": "Keep each reaction under 8 seconds...",
--   "difficulty": "Easy"
-- }

ALTER TABLE clips
ADD COLUMN IF NOT EXISTS recipe JSONB DEFAULT '{}'::jsonb;

-- Recreate the clips_with_meta view to include the new column.
drop view if exists public.clips_with_meta cascade;

create view public.clips_with_meta as
select
  c.*,
  coalesce(cp.people_count, 0) as people_count,
  coalesce(a.approvals_total, 0) as approvals_total,
  coalesce(a.approvals_approved, 0) as approvals_approved,
  coalesce(a.approvals_waiting, 0) as approvals_waiting,
  coalesce(a.approvals_blocked, 0) as approvals_blocked
from public.clips c
left join (
  select clip_id, count(*) as people_count
  from public.clip_people group by clip_id
) cp on cp.clip_id = c.id
left join (
  select clip_id,
    count(*) as approvals_total,
    count(*) filter (where status in ('Approved','Approved With Edits')) as approvals_approved,
    count(*) filter (where status = 'Waiting') as approvals_waiting,
    count(*) filter (where status in ('Do Not Post','No Tag')) as approvals_blocked
  from public.approvals group by clip_id
) a on a.clip_id = c.id;

grant select on public.clips_with_meta to authenticated;
