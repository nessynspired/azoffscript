drop policy if exists approvals_upsert_own on public.approvals;
create policy approvals_upsert_own on public.approvals
  for insert to authenticated with check (
    -- case 1: member creating their own approval
    (member_id = public.current_member_id() and public.is_member_of_clip(clip_id))
    -- case 2: submitter or admin seeding a Waiting approval for a tagged member
    or (
      (public.is_admin() or exists (
        select 1 from public.clips c
        where c.id = clip_id and c.submitted_by = public.current_member_id()
      ))
      and exists (select 1 from public.clip_people cp where cp.clip_id = clip_id and cp.member_id = approvals.member_id)
    )
  );
