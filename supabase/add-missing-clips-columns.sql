-- Idempotent migration: add columns that may be missing from an existing
-- `clips` table. Safe to run multiple times — each statement checks first.
-- Run this in the Supabase Dashboard → SQL Editor.

-- category
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'clips'
                   and column_name = 'category') then
    alter table public.clips add column category text;
  end if;
end $$;

-- destination
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'clips'
                   and column_name = 'destination') then
    alter table public.clips add column destination text;
  end if;
end $$;

-- platform
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'clips'
                   and column_name = 'platform') then
    alter table public.clips add column platform public.platform;
  end if;
end $$;

-- best_timestamp
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'clips'
                   and column_name = 'best_timestamp') then
    alter table public.clips add column best_timestamp text;
  end if;
end $$;

-- do_not_post_notes
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'clips'
                   and column_name = 'do_not_post_notes') then
    alter table public.clips add column do_not_post_notes text;
  end if;
end $$;

-- scheduled_date
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'clips'
                   and column_name = 'scheduled_date') then
    alter table public.clips add column scheduled_date timestamptz;
  end if;
end $$;

-- idea_due_date
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'clips'
                   and column_name = 'idea_due_date') then
    alter table public.clips add column idea_due_date timestamptz;
  end if;
end $$;

-- clip_due_date
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'clips'
                   and column_name = 'clip_due_date') then
    alter table public.clips add column clip_due_date timestamptz;
  end if;
end $$;

-- final_cut_due
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'clips'
                   and column_name = 'final_cut_due') then
    alter table public.clips add column final_cut_due timestamptz;
  end if;
end $$;

-- approval_due
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'clips'
                   and column_name = 'approval_due') then
    alter table public.clips add column approval_due timestamptz;
  end if;
end $$;

-- thumbnail_url
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'clips'
                   and column_name = 'thumbnail_url') then
    alter table public.clips add column thumbnail_url text;
  end if;
end $$;

-- caption
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'clips'
                   and column_name = 'caption') then
    alter table public.clips add column caption text;
  end if;
end $$;

-- Recreate the view so it picks up the new columns
create or replace view public.clips_with_meta as
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
