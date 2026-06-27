# Supabase — schema, seed & auth (Phase 2, tasks 17–18)

This directory defines the database. **Child mode still runs entirely on
`localStorage`** (Phase 1, unchanged) — only the `/parent` area uses Supabase.
The app's per-child progress moves off `localStorage` in task 19.

## Layout

- `migrations/0001_initial_schema.sql` (task 17) — enums, tables, indexes, RLS.
  Content tables (`english_themes`, `english_items`, `huts`, `stickers`) are
  world-readable; per-child tables (`children`, `child_skill_levels`,
  `learning_attempts`) have RLS enabled.
- `migrations/0002_auth_policies.sql` (task 18) — `parents` profile (1:1 with
  `auth.users`, holds the gate `pin_hash`), an `on_auth_user_created` trigger,
  the `children.parent_id → parents` FK, and the **per-child RLS policies**
  scoping access to `auth.uid()` via parent ownership.
- `migrations/0003_progress_tables.sql` (task 19) — per-child progress now lives
  in Supabase: `earned_stickers` (ordered), `hut_progress`, `theme_mastery`, all
  RLS-scoped via child ownership (`learning_attempts` from task 17 is now written
  per round). **`supabase db push` this before the live site can save progress.**
- `seed.sql` — **generated**, do not edit by hand. Loads the mock data: 4 themes,
  20 vocabulary items (9 Weather + 11 Animals), 16 huts, the 60-sticker catalog,
  Milo + Sunny and their per-skill levels. Re-load it after adding a theme.
- `seed/generate-seed.ts` — regenerates `seed.sql` from `src/data/`.

## One-time parent setup (task 18)

The parent area uses a **single shared account** that owns both children.

1. Create the parent: Dashboard → **Authentication → Users → Add user** (email +
   password, "auto-confirm"). The trigger auto-creates its `parents` row.
2. Link the seeded children to that account (SQL Editor). The trigger copies the
   email into `parents`, so you can look the id up there without touching the
   `auth` schema:
   ```sql
   update children
   set parent_id = (select id from parents where email = '<parent-email>')
   where id in ('milo', 'sunny');
   ```
3. Set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see
   `.env.example`) locally and in Vercel. The PIN is set on the parent's first
   visit to `/parent`.

## Regenerate the seed

After editing any mock data (`src/data/themes*`, `children.ts`, `sticker-bank.ts`):

```bash
npx tsx supabase/seed/generate-seed.ts
```

`unit/seed.test.ts` fails if the seed builder and the mock data disagree, so a
stale seed is caught in CI.

## Apply locally (requires Docker + the Supabase CLI)

```bash
supabase start            # boots local Postgres + Studio
supabase db reset         # applies migrations/, then loads seed.sql
```

## Apply to the hosted free-tier project (task 18+)

```bash
supabase link --project-ref <ref>
supabase db push          # applies migrations to the hosted DB
# seed.sql can be loaded once via the SQL editor or `supabase db reset --linked`
```

The Supabase CLI is a dev tool invoked via `npx`/global install — it is **not** an
app dependency, so the Vercel build and CI are unaffected.
