-- Add email column to join_submissions so we can auto-send invite codes
-- to approved applicants. Required by the new Join form.
-- Safe to re-run (uses IF NOT EXISTS).

alter table public.join_submissions add column if not exists email text;

-- Index for lookups (e.g. checking for duplicate submissions by email)
create index if not exists idx_join_submissions_email on public.join_submissions(email);
