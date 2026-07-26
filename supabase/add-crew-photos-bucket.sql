-- Create the crew-photos storage bucket (public — used for portal avatars + website crew photos)
-- Safe to re-run (uses ON CONFLICT DO NOTHING)

insert into storage.buckets (id, name, public)
values ('crew-photos', 'crew-photos', true)
on conflict (id) do nothing;

-- RLS policies for crew-photos bucket
-- Members can upload to their own folder (path starts with their member id)
-- Everyone can read (public bucket — photos are shown on the website)
-- Owner or admin can delete

drop policy if exists "crew photos upload own" on storage.objects;
create policy "crew photos upload own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'crew-photos'
    and (auth.uid() = (storage.foldername(name))[1]::uuid or public.is_admin())
  );

drop policy if exists "crew photos read all" on storage.objects;
create policy "crew photos read all" on storage.objects
  for select using (bucket_id = 'crew-photos');

drop policy if exists "crew photos delete own or admin" on storage.objects;
create policy "crew photos delete own or admin" on storage.objects
  for delete to authenticated using (
    bucket_id = 'crew-photos'
    and (auth.uid() = (storage.foldername(name))[1]::uuid or public.is_admin())
  );
