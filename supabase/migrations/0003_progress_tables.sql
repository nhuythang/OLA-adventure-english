-- OLA English Adventure — per-child progress tables (Phase 2, task 19).
--
-- Moves the Phase 1 localStorage progress (ChildProgress in src/lib/storage.ts)
-- into Supabase so it follows a child across devices. The app reads/writes these
-- through the signed-in parent's session; RLS scopes every row to the parent who
-- owns the child. `child_skill_levels` (task 17) and `learning_attempts`
-- (task 17) already cover per-skill level + the raw attempt log.

-- Ordered list of stickers a child has earned (the one-by-one collection). `seq`
-- preserves the earn order that drives the sticker book; a sticker is earned once.
create table earned_stickers (
  child_id   text        not null references children (id) on delete cascade,
  sticker_id text        not null references stickers (id),
  theme_id   text        not null references english_themes (id) on delete cascade,
  seq        integer     not null,
  earned_at  timestamptz not null default now(),
  primary key (child_id, sticker_id)
);
create index earned_stickers_order_idx on earned_stickers (child_id, seq);

-- Per hut (theme × skill): finished at least once, and whether it was mastered
-- (≈80% first-try). Mirrors completedHuts / masteredHuts.
create table hut_progress (
  child_id   text        not null references children (id) on delete cascade,
  theme_id   text        not null references english_themes (id) on delete cascade,
  skill      skill_kind  not null,
  completed  boolean     not null default false,
  mastered   boolean     not null default false,
  updated_at timestamptz not null default now(),
  primary key (child_id, theme_id, skill)
);

-- A theme whose 4 huts are all mastered (master legendary granted, next island
-- unlocked). Mirrors masteredThemes.
create table theme_mastery (
  child_id    text        not null references children (id) on delete cascade,
  theme_id    text        not null references english_themes (id) on delete cascade,
  mastered_at timestamptz not null default now(),
  primary key (child_id, theme_id)
);

-- ---- RLS: a parent may touch only rows for children they own ----
alter table earned_stickers enable row level security;
alter table hut_progress    enable row level security;
alter table theme_mastery   enable row level security;

create policy "parent owns earned stickers" on earned_stickers
  for all to authenticated
  using (exists (select 1 from children c where c.id = earned_stickers.child_id and c.parent_id = auth.uid ()))
  with check (exists (select 1 from children c where c.id = earned_stickers.child_id and c.parent_id = auth.uid ()));

create policy "parent owns hut progress" on hut_progress
  for all to authenticated
  using (exists (select 1 from children c where c.id = hut_progress.child_id and c.parent_id = auth.uid ()))
  with check (exists (select 1 from children c where c.id = hut_progress.child_id and c.parent_id = auth.uid ()));

create policy "parent owns theme mastery" on theme_mastery
  for all to authenticated
  using (exists (select 1 from children c where c.id = theme_mastery.child_id and c.parent_id = auth.uid ()))
  with check (exists (select 1 from children c where c.id = theme_mastery.child_id and c.parent_id = auth.uid ()));
