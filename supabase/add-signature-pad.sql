-- Add drawn signature image (base64 PNG) and signed date to agreement_signatures
-- This lets crew sign with their finger/stylus/mouse on phone, laptop, or iPad
-- and the drawn signature + date they entered is stored with the record.

alter table public.agreement_signatures
  add column if not exists signature_data text,    -- base64 PNG data URL of drawn signature
  add column if not exists signed_date date;       -- date the participant entered (not auto now())

-- Backfill signed_date for any existing rows from created_at
update public.agreement_signatures
  set signed_date = created_at::date
  where signed_date is null;
