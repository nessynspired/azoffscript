-- ==========================================================================
-- Fix storage RLS: allow all authenticated crew to read video uploads
-- (Previously only the uploader or admin could read — crew couldn't watch
--  each other's videos. Now all authenticated members can read from the
--  clips bucket so they can watch videos in the portal.)
-- ==========================================================================

-- Read: all authenticated members can read from the clips bucket
drop policy if exists "clips read own or admin" on storage.objects;
drop policy if exists "clips read all crew" on storage.objects;
create policy "clips read all crew" on storage.objects
  for select to authenticated using (bucket_id = 'clips');

-- Upload: members can upload to their own folder; admin can upload anywhere
drop policy if exists "clips upload own" on storage.objects;
create policy "clips upload own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'clips'
    and (auth.uid() = (storage.foldername(name))[1]::uuid or public.is_admin())
  );

-- Delete: owner or admin only
drop policy if exists "clips delete own or admin" on storage.objects;
create policy "clips delete own or admin" on storage.objects
  for delete to authenticated using (
    bucket_id = 'clips'
    and (auth.uid() = (storage.foldername(name))[1]::uuid or public.is_admin())
  );
