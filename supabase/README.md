# Supabase — schema & seed (Phase 2, task 17)

This directory defines the database. **Task 17 is schema + seed only** — no app
code talks to Supabase yet. Parent auth + RLS policies land in task 18, and the
app's persistence moves off `localStorage` in task 19. Until then the game runs
entirely on `localStorage` exactly as in Phase 1.

## Layout

- `migrations/0001_initial_schema.sql` — enums, tables, indexes, RLS. Content
  tables (`english_themes`, `english_items`, `huts`, `stickers`) are world-readable;
  per-child tables (`children`, `child_skill_levels`, `learning_attempts`) have RLS
  enabled but **no policies yet** (locked until task 18 scopes them to `auth.uid()`).
- `seed.sql` — **generated**, do not edit by hand. Loads the Phase 1 mock data
  (4 themes, 9 Weather words, 16 huts, the 60-sticker catalog, Milo + Sunny and
  their per-skill levels).
- `seed/generate-seed.ts` — regenerates `seed.sql` from `src/data/`.

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
