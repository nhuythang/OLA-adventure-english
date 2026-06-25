-- OLA English Adventure — initial schema (Phase 2, task 17).
--
-- Mirrors the Phase 1 mock data shapes in src/lib/types.ts so persistence can
-- migrate off localStorage in task 19 without reshaping anything. This migration
-- only defines structure + RLS; rows are loaded by supabase/seed.sql.
--
-- RLS posture (task 17): content tables are world-readable; per-child tables have
-- RLS enabled but NO policies yet — they stay locked until task 18 ties access to
-- auth.uid() via parent_id. The seed runs as the postgres role and bypasses RLS.

-- ---- Enums (mirror the TS union types) ----
create type skill_kind     as enum ('listen', 'speak', 'read', 'write');
create type cefr_level     as enum ('starter', 'mover', 'flyer');
create type sticker_rarity as enum ('common', 'rare', 'epic', 'legendary');
create type sticker_set    as enum ('boy', 'girl');

-- ============================================================================
-- Content tables (curriculum + sticker catalog) — public read, no public write.
-- ============================================================================

-- Theme islands (Theme in types.ts). `sort_order` drives map order + unlocking.
create table english_themes (
  id         text primary key,
  title      text        not null,
  can_do     text        not null,
  sort_order integer     not null,
  emoji      text        not null
);

-- Vocabulary items per theme (VocabWord). `min_level` is the lowest level whose
-- pool includes the word: Starter sees only min_level='starter' words, while
-- Mover/Flyer see everything (weatherWordsForLevel). `sort_order` keeps the
-- round-target order stable (huts take the first N).
create table english_items (
  id         text primary key,
  theme_id   text        not null references english_themes (id) on delete cascade,
  word       text        not null,
  emoji      text        not null,
  vi         text        not null,
  min_level  cefr_level  not null,
  sort_order integer     not null
);
create index english_items_theme_id_idx on english_items (theme_id);

-- The 4 skill huts inside each theme island. One row per (theme, skill).
create table huts (
  id       text       primary key,
  theme_id text       not null references english_themes (id) on delete cascade,
  skill    skill_kind not null,
  unique (theme_id, skill)
);
create index huts_theme_id_idx on huts (theme_id);

-- Collectible sticker catalog (CharacterSticker). `set` and `rarity` mirror the
-- bank in src/data/stickers/sticker-bank.ts. Earned-sticker rows (per child) and
-- hut/theme progress arrive with the persistence migration (task 19).
create table stickers (
  id     text           primary key,
  name   text           not null,
  emoji  text           not null,
  "set"  sticker_set    not null,
  rarity sticker_rarity not null,
  tags   text[]         not null default '{}'
);
create index stickers_set_idx on stickers ("set");

-- ============================================================================
-- Per-child tables — RLS enabled, policies deferred to task 18 (parent auth).
-- ============================================================================

-- Child profiles (ChildProfile). `parent_id` links to auth.users in task 18;
-- nullable now so the seed can load profiles before auth exists.
create table children (
  id          text        primary key,
  parent_id   uuid,
  name        text        not null,
  avatar      text        not null,
  sticker_set sticker_set not null,
  created_at  timestamptz not null default now()
);
create index children_parent_id_idx on children (parent_id);

-- Per-skill level for each child — the heart of adapting one engine to the 4–7
-- band. Mirrors ChildProfile.skillLevels and the dev/parent override (task 16).
create table child_skill_levels (
  child_id text       not null references children (id) on delete cascade,
  skill    skill_kind not null,
  level    cefr_level not null,
  primary key (child_id, skill)
);

-- One row per round item attempted (Attempt). Raw event log; mastery (≈80%
-- first-try) is derived from it. `item_id` is nullable for skills without a
-- single vocab target (e.g. trace/spell rounds).
create table learning_attempts (
  id               uuid        primary key default gen_random_uuid (),
  child_id         text        not null references children (id) on delete cascade,
  hut_id           text        not null references huts (id) on delete cascade,
  item_id          text        references english_items (id) on delete set null,
  first_try_correct boolean    not null,
  hints_used       integer     not null default 0,
  created_at       timestamptz not null default now()
);
create index learning_attempts_child_id_idx on learning_attempts (child_id);
create index learning_attempts_hut_id_idx   on learning_attempts (hut_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table english_themes      enable row level security;
alter table english_items       enable row level security;
alter table huts                enable row level security;
alter table stickers            enable row level security;
alter table children            enable row level security;
alter table child_skill_levels  enable row level security;
alter table learning_attempts   enable row level security;

-- Content is read-only for everyone (the curriculum + sticker catalog are not
-- secret). Writes happen only via migrations/seed (postgres role bypasses RLS).
create policy "content read: themes"   on english_themes for select to anon, authenticated using (true);
create policy "content read: items"    on english_items  for select to anon, authenticated using (true);
create policy "content read: huts"     on huts           for select to anon, authenticated using (true);
create policy "content read: stickers" on stickers       for select to anon, authenticated using (true);

-- children / child_skill_levels / learning_attempts: RLS enabled, no policies →
-- locked to client roles until task 18 adds parent-scoped policies on auth.uid().
