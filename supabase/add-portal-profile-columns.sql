-- Add Round 2 portal profile columns to members
-- Safe to re-run (uses IF NOT EXISTS)

-- Multi-select room vibe chips (Funny, Quiet, Blunt, etc.)
alter table public.members add column if not exists room_vibe text[] default '{}';

-- Tag preference: 'Yes, tag me when I'm posted' | 'Ask me before tagging' | etc.
alter table public.members add column if not exists tag_me text;

-- Best platform to tag: TikTok | Instagram | etc.
alter table public.members add column if not exists best_platform text;
