-- Idempotent migration: add columns that may be missing from an existing
-- `members` table. Safe to run multiple times — each statement checks first.
-- Run this in the Supabase Dashboard → SQL Editor.

-- mailing_address
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'mailing_address') then
    alter table public.members add column mailing_address text;
  end if;
end $$;

-- comfort_level
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'comfort_level') then
    alter table public.members add column comfort_level text default 'Ask Every Time';
  end if;
end $$;

-- share_comfort
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'share_comfort') then
    alter table public.members add column share_comfort text default 'Ask before tagging/sharing';
  end if;
end $$;

-- do_not_use_for
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'do_not_use_for') then
    alter table public.members add column do_not_use_for text[] default '{}';
  end if;
end $$;

-- nickname
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'nickname') then
    alter table public.members add column nickname text;
  end if;
end $$;

-- design_edition
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'design_edition') then
    alter table public.members add column design_edition text;
  end if;
end $$;

-- plot_twist
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'plot_twist') then
    alter table public.members add column plot_twist text;
  end if;
end $$;

-- comfort_tags
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'comfort_tags') then
    alter table public.members add column comfort_tags text[] default '{}';
  end if;
end $$;

-- favorite_content
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'favorite_content') then
    alter table public.members add column favorite_content text[] default '{}';
  end if;
end $$;

-- availability
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'availability') then
    alter table public.members add column availability text;
  end if;
end $$;

-- socials
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'socials') then
    alter table public.members add column socials jsonb default '{}';
  end if;
end $$;

-- photo_url
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'photo_url') then
    alter table public.members add column photo_url text;
  end if;
end $$;

-- first_wave
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'first_wave') then
    alter table public.members add column first_wave boolean not null default true;
  end if;
end $$;

-- kit_acknowledged
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'kit_acknowledged') then
    alter table public.members add column kit_acknowledged boolean not null default false;
  end if;
end $$;

-- ground_rules_acknowledged_at
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'ground_rules_acknowledged_at') then
    alter table public.members add column ground_rules_acknowledged_at timestamptz;
  end if;
end $$;

-- can_plan_content: lets a crew member edit calendar/deadlines + change clip statuses
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'members'
                   and column_name = 'can_plan_content') then
    alter table public.members add column can_plan_content boolean not null default false;
  end if;
end $$;
