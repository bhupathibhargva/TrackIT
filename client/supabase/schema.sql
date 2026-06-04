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

-- Allow the anon key (used by the web app and Siri Shortcut) to read/write
alter table tasks enable row level security;
create policy "family_rw" on tasks for all using (true) with check (true);
