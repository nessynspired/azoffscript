-- Add Round 2 join form columns to join_submissions
-- Safe to re-run (uses IF NOT EXISTS)

-- Multi-select content interests (chips)
alter table public.join_submissions add column if not exists content_interests text[] default '{}';

-- Multi-select availability slots (chips)
alter table public.join_submissions add column if not exists availability_slots text[] default '{}';

-- Willingness to try first drop: 'yes' | 'maybe' | 'not_sure' | 'no'
alter table public.join_submissions add column if not exists willingness text;

-- Free-text "anything we should know"
alter table public.join_submissions add column if not exists anything_else text;
