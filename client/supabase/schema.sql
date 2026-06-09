-- Run this once in your Supabase project: Dashboard → SQL Editor → New query

create table if not exists tasks (
  id             text        primary key,
  title          text        not null,
  category       text        not null default 'tasks',
  priority       integer     not null default 3,
  assignee       text        not null default 'Both',
  done           boolean     not null default false,
  recurrence     text,
  scheduled_date text,
  scheduled_time text,
  due_date       text,
  duration       integer,
  notes          text                 default '',
  completed_dates text[]     not null default '{}',
  created_at     timestamptz not null default now()
);

-- Allow the anon key (used by the web app and Siri Shortcut) to read/write.
--
-- SECURITY TRADEOFF — read before sharing your app URL:
-- The anon key ships inside the public JS bundle, and this policy lets that
-- key read, modify, and delete every row. Anyone who finds your deployed URL
-- can therefore access all family tasks. This is a deliberate tradeoff to
-- keep the Siri Shortcut working without authentication. If that ever stops
-- being acceptable, enable Supabase Auth (email magic link), scope this
-- policy to authenticated users, and switch the Siri Shortcut to a Supabase
-- Edge Function holding a private token.
alter table tasks enable row level security;
create policy "family_rw" on tasks for all using (true) with check (true);
