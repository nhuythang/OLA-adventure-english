-- OLA English Adventure — daily streaks (Phase 3, task 23).
--
-- One row per child tracking the consecutive-day streak (a gentle habit nudge,
-- no penalty for gaps). `awarded_milestones` records which streak milestones have
-- already granted their bonus sticker, so each is granted once. RLS scopes rows
-- to the parent who owns the child, like the other progress tables.
create table child_streaks (
  child_id          text        primary key references children (id) on delete cascade,
  last_active_date  date,
  current_streak    integer     not null default 0,
  awarded_milestones integer[]  not null default '{}',
  updated_at        timestamptz not null default now()
);

alter table child_streaks enable row level security;

create policy "parent owns child streaks" on child_streaks
  for all to authenticated
  using (exists (select 1 from children c where c.id = child_streaks.child_id and c.parent_id = auth.uid ()))
  with check (exists (select 1 from children c where c.id = child_streaks.child_id and c.parent_id = auth.uid ()));
