-- ===========================================================================
-- Agreement audit log — tamper-evident record of every signature event
-- ===========================================================================
-- This table exists for LEGAL PROTECTION. It proves WHO signed, FROM WHERE,
-- on WHAT DEVICE, at WHAT TIME, and under WHICH authenticated session.
--
-- The signature row in agreement_signatures can be inserted by the member
-- (RLS enforces member_id = auth.uid()), but this audit log is written
-- SERVER-SIDE using the service role key, so it records the real IP address
-- and the real auth user ID — neither of which can be faked by the client.
--
-- Admin CANNOT insert, update, or delete audit log entries. Only the server
-- (service role) can write here. This prevents tampering.
-- ===========================================================================

create table if not exists public.agreement_audit_log (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  action          text not null,                    -- 'signed', 'viewed', 'downloaded', 'emailed'
  agreement_id    uuid references public.agreements(id) on delete cascade,
  signature_id    uuid references public.agreement_signatures(id) on delete cascade,
  member_id       uuid references public.members(id) on delete cascade,
  auth_user_id    uuid,                             -- supabase auth user ID (proves which login)
  member_email    text,
  ip_address      inet,                             -- real IP captured server-side
  user_agent      text,                             -- browser/device string
  metadata        jsonb                             -- extra context (e.g. printed_name, signed_date)
);

create index if not exists idx_audit_agreement on public.agreement_audit_log(agreement_id);
create index if not exists idx_audit_member on public.agreement_audit_log(member_id);
create index if not exists idx_audit_signature on public.agreement_audit_log(signature_id);
create index if not exists idx_audit_created on public.agreement_audit_log(created_at desc);

-- RLS: admin can read; NOBODY can write via client (only service role bypasses RLS)
alter table public.agreement_audit_log enable row level security;

drop policy if exists audit_read_admin on public.agreement_audit_log;
create policy audit_read_admin on public.agreement_audit_log
  for select to authenticated using (public.is_admin());

-- IMPORTANT: No INSERT/UPDATE/DELETE policy for authenticated users.
-- Only the service role key (server-side) can write, because the service
-- role bypasses RLS. This makes the audit log tamper-evident.
