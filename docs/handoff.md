# OLA English Adventure — handoff

Read this first to continue the project in a new session. Source of truth for the
plan is [`docs/tasks/00-index.md`](tasks/00-index.md); the *why* is
[`docs/game-design-spec.md`](game-design-spec.md); the rules are [`CLAUDE.md`](../CLAUDE.md).

## Status (2026-07-14)

**Phases 1–3 are essentially complete and deployed** (tasks 01–26 all ☑). Phase 1 vertical slice;
Phase 2 (17–21: schema+seed, parent auth+PIN, Supabase persistence, Flyer L3, 2nd theme+interleaving);
Phase 3 (22 placement, 23 streaks, 24 dashboard, 25 wordlist, 26 PWA). Plus follow-ups that **filled
all four islands** (Weather, Animals, Food, Colours) and then **deepened** Animals/Food to 24 words
each (PRs #38, #39) — all play across all 4 huts × 3 levels, progress in Supabase (per-child,
multi-device) under the parent session; localStorage fallback when unconfigured (dev:demo / e2e).
**158 unit + 17 e2e green.**

### What's NEXT (start here)
1. **Grammar journey — G1 through G6 are DONE.** G1 (PR #33): Grammar island, Plurals + Present
   continuous, all four huts, always unlocked; `buildGrammarQuestions` = choices are grammatical
   contrasts of the same referent. G2 (PR #34): Prepositions of place (in/on/under/next to) + the first
   inline-SVG teaching art (`src/data/grammar/scenes.ts` + `grammar-scene.tsx`'s `PrepositionScene`/
   `resolveChoiceVisual`/`PromptVisual`). G3 (PR #35): the "Observe" intro beat — `ObserveFrame`/
   `GrammarStructure.observe` per structure, `GRAMMAR_OBSERVE_FRAMES` registry, `ObserveIntro` component
   shown once before each grammar hut's rounds, paced by the speech engine's `onEnd`, skippable,
   reduced-motion aware. G4 (PR #36): per-item attempt logging — `Attempt.itemId` set at every
   attempt-creation site, combined with `themeId` at the persistence boundary in `remote.ts`
   (`item_id: ${themeId}-${itemId}`); `migrations/0005_attempt_item_id.sql` drops the `item_id` FK
   since grammar items aren't rows in `english_items`. G5 (PR #40): spaced review + VN-L1 weighting —
   `src/lib/progress/review-schedule.ts` (Leitner-style 0/1/3/7/14-day due schedule, `ChildProgress.
   itemStats` derived from `learning_attempts` in Supabase mode / maintained in the blob in localStorage
   mode); `review.ts`'s ~30% review pool now ranks due-and-weak items first; `grammarRoundItems` is a
   weighted round-robin favoring `vnFocus` structures (plurals, present-continuous) over prepositions,
   without clumping. G6 (PR #42): parent dashboard grammar section — per-structure first-try accuracy +
   most-missed items, per child, in `src/components/parent/dashboard.tsx`; `dashboard-data.ts` parses
   the composite `item_id` against a *known* structure list (`GRAMMAR_STRUCTURE_IDS`, now exported from
   `data/grammar/index.ts`) rather than a naive string split. **Not yet visually verified live** — needs
   a real parent login (same as task 24 originally). Migrations confirmed pushed through 0004; **0005
   still needs `supabase db push`** (G5/G6 only read `item_id`, no new migration needed for either).
   The rest is planned as a **G-series in [`docs/tasks/00-index.md`](tasks/00-index.md)** (rationale:
   [`docs/research/grammar-build-roadmap.md`](research/grammar-build-roadmap.md)).
   **Next task = G7 — Scale up: Movers/Flyers grammar** (past simple, comparatives, "going to" via
   sentence-build + scenes; plus this/that, can-for-ability, there is/are — likely split into G7a/G7b to
   stay session-sized).
2. **Task 27 — real-iPad pass** (on-device, you): Add to Home Screen → confirm fullscreen + star icon;
   log in as parent (PIN) → dashboard/placement; play a hut; confirm progress + streak persist; verify
   emoji teaching pictures render on iPadOS.

### Open product decisions (your call — see CLAUDE.md "Open questions")
- **Weather is a YLE *Movers* topic**, not Starters (task 25 finding). Consider making **Animals** the
  Starter intro island and re-leveling Weather to Movers. One-ish-file change; not done.
- **Islands unlock in sequence** by design (master one → next opens). If you want all islands open from
  the start, it's a one-line change in `isThemeUnlocked`.
- **Grammar: island vs woven** — roadmap recommends a dedicated Grammar island first.

### Supabase housekeeping (so the live site fully works)
You said all migrations are pushed. Confirm **0002–0004 applied** and **`supabase/seed.sql` re-loaded**
(now 38 items incl. Food/Colours + `animals-horse` replacing `animals-pig`). Child progress/streaks need
the tables under the parent session.

### Wordlist source of truth (task 25)
- Resolved: **official Cambridge YLE** (2025). `src/data/wordlist/cambridge-yle.ts` (Animals + Weather
  topic words → YLE level, parsed from the official PDF), `src/lib/wordlist.ts` `reconcileTheme`.
- Findings: `pig` isn't a YLE headword → Animals' `pig`→`horse` (re-load `supabase/seed.sql`).
  **Weather is a Movers topic** (all words Movers+; rainy/snowy/stormy aren't headwords) — pinned as
  documented deviations in `unit/wordlist.test.ts` so the theme stays playable and new misalignments fail.
- **Open product decision:** make **Animals** the Starter intro island (it's all-Starters in YLE) and
  treat **Weather** as Movers, rather than teaching Movers weather at Starter. Not done — needs your call.

### All four islands now have content
- **Food** (`data/themes/food.ts`, 9 words) and **Colours** (`data/themes/colors.ts`, 9 words — coloured-
  square emoji as pictures) added and registered. Both reconcile **clean** against YLE; all 4 islands
  (Weather, Animals, Food, Colours) are playable across all skills/levels. Seed now has 38 items —
  **re-load `supabase/seed.sql`**.
- Islands still **unlock in order** (master one → next opens), by design — so a fresh child sees only
  Weather open. If you'd rather have all islands tappable from the start, it's a one-line change in
  `isThemeUnlocked` (say the word).

### Streaks (task 23)
- Pure logic in `src/lib/progress/streak.ts` (unit-tested): `updateStreak` advances on a new calendar
  day, resets to 1 after a gap, flags a milestone (3/7/14/30) once. Wired into `recordHutResult`
  (storage.ts) — a milestone grants one bonus sticker (next un-earned). 🔥 count on the sticker-book home,
  bonus celebration in the reward overlay.
- Persistence: `child_streaks` table (`migrations/0004_streaks.sql`, RLS-scoped) via `persistStreakRemote`
  / `loadRemote`; localStorage carries the fields in the progress blob. **`supabase db push` 0004** before
  it works on the live site. Uses the device clock (`todayISO`) for "today".

### Placement (task 22)
- Parent questionnaire (not a child quiz): `/parent/placement/[childId]` (PIN-gated; re-checks the
  `PIN_OK_COOKIE` since it's outside the `/parent` landing page), linked from each dashboard child card.
  One Vietnamese question per skill, 3 leveled can-do options → `setSkillLevel` per changed skill. It's
  also the parent-adjustable per-skill editor. Content + `PlacementForm` are pure-ish; e2e is unconfigured
  so it only sees the redirect — verify level changes by logging in.

### Parent dashboard (task 24)
- Lives on `/parent` after the PIN gate (`src/app/parent/page.tsx`). Read-only, Vietnamese. Per child:
  per-skill level + first-try accuracy, per-theme huts-mastered + theme-master badge, the sticker book.
- Pure aggregation `src/lib/parent/dashboard-data.ts` (`summarize`, unit-tested) over RLS-scoped Supabase
  rows; view `src/components/parent/dashboard.tsx`. Queries are unfiltered selects — RLS already scopes
  them to the signed-in parent's children. Not exercised by e2e (needs auth) — verify by logging in.

### PWA (task 26)
- Installable + fullscreen on iPad: `src/app/manifest.ts` (`display: standalone`), `src/app/icon.svg`
  (favicon) + `src/app/apple-icon.png` (180, apple-touch), `apple-mobile-web-app-capable`. Icons are
  generated from an inline SVG by `node scripts/generate-icons.mjs` → `public/icons/*.png` (re-run after
  changing the art).
- **Hand-rolled** `public/sw.js` (no Serwist — this app has no media files to precache; see the task-26
  decision note in the index). Network-first for navigations (auth redirects + fresh deploys win), cache-
  first for hashed `/_next` + icons, `/offline.html` fallback. Registered **production-only** via
  `src/components/pwa/service-worker-register.tsx`, so dev/e2e never cache. **Bump `CACHE` in sw.js** to
  retire the old cache after changing it.
- Not yet validated on a real iPad — that's task 27 (Add to Home Screen → confirm fullscreen + icon).

### Theme content + interleaving (task 21)
- `src/data/themes/content.ts` is the **registry** (themeId → word pool + Flyer templates). Add a theme
  by writing `data/themes/<x>.ts` and registering it — huts + seed pick it up automatically.
- Listen/Read interleave ~30% review from mastered themes (`src/lib/review.ts` + `engine/interleave.ts`,
  deterministic/SSR-safe). Speak/Write are current-theme only for now.
- Animals island unlocks after Weather is mastered (existing `isThemeUnlocked`); deep-linking a hut route
  bypasses the map lock (used by the e2e). Run `supabase db push` is NOT needed (no new tables), but
  **re-load `supabase/seed.sql`** to get the new Animals items (20 items now).

- **Live (production):** https://ola-adventure-english.vercel.app
- The full loop works end-to-end: **chooser → sticker book → map → Weather island →
  Listen / Speak / Read / Write huts → one-by-one reward overlay → stickers saved per child.**
- Per-skill leveling (Starter/Mover) drives both mechanics *and* vocabulary; a "Levels (dev)"
  toggle on the sticker book flips it at runtime.
- Two mock children: **Milo** (🦊, all Starter) and **Sunny** (🐰, Mover except Write).

## How to work (non-negotiable workflow)

Per-task: **branch off `main` → implement → verify → PR → watch CI → merge.** Never commit to `main`.

- Commit author email: **`nguyenhuy.thang0302@gmail.com`** (already set locally). Trailer:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **Branch protection requires the `check` CI job** before merge. `gh pr merge` won't merge until green.
- **Every merge to `main` auto-deploys to production** (CI `deploy` job, gated on `check`). Secrets
  `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` are set.

### Commands
```bash
npm run dev            # dev server (default :3000)
npm run dev:demo       # dev with empty Supabase env (kid routes don't bounce to auth)
npm run typecheck      # tsc --noEmit
npm run lint
npm run test:unit      # vitest (57 tests)
npm run test:e2e       # bddgen + playwright (9 scenarios, dev server on :3003)
npm run build
```
Verify all of tsc/lint/unit/build/e2e before pushing. After a PR: watch CI with
`gh run watch <id> --exit-status`, then `gh pr merge <n> --merge --delete-branch`.

## Architecture / key files

- **Engine (pure, unit-tested):** `src/lib/engine/` — `hut-machine.ts` (scaffold-and-reveal state
  machine), `choices.ts` (random answer position), `scoring.ts` (first-try-only mastery, 80%),
  `award.ts` (one-by-one sticker order), `picture-questions.ts`. Hook: `use-hut-engine.ts`.
- **Huts:** `src/components/huts/` — `hut-player.tsx` (reusable round UI for Listen/Read via
  `promptMode` audio|word), `listen-hut`, `read-hut`, `write-hut` (trace + tiles), `speak-hut`
  (self-rate / ASR), `hut-result.tsx` (records result + shows reward), `trace-pad`, `letter-tiles`.
- **Screens:** `src/components/game/` — `sticker-book-home`, `island-map`, `island-screen`,
  `tablet-shell`, `screen-header`, `view-transition-link`. Routes under `src/app/child/[childId]/…`.
- **Rewards:** `src/components/rewards/reward-overlay.tsx` (Framer, reduced-motion aware).
- **Persistence:** `src/lib/storage.ts` (localStorage per child: earned stickers, completed/mastered
  huts, mastered themes, per-skill level overrides) read via `use-child-progress.ts`
  (`useSyncExternalStore`). Award via `recordHutResult`.
- **Data:** `src/data/` — `children.ts`, `themes.ts`, `themes/weather.ts` (`weatherWordsForLevel`),
  `stickers/sticker-bank.ts` (30 boy + 30 girl original mascots, emoji placeholders), `letters.ts`.
- **Audio:** `src/lib/speech.ts` (TTS), `asr.ts` (best-effort), `sounds.ts` (Web Audio chimes).
- **Tokens/styles:** `src/app/globals.css` (Tailwind v4 `@theme`, native-feel base CSS).
- **Tests:** `unit/*.test.ts` (vitest), `features/*.feature` + `features/steps/*.ts` (playwright-bdd).

## Gotchas (hard-won — don't relearn)

- **Never call `speechSynthesis.cancel()`** (breaks Chrome/macOS) — `speech.ts` holds-then-advances.
- **Shuffle on the CLIENT after mount, never during SSR** — `Math.random` in render → hydration
  mismatch. The engine uses a `prepare` action; tiles use a deterministic seed. See `choices.ts` SSR note.
- **Persistence reads via `useSyncExternalStore`** (not setState-in-effect — lint forbids it, and it
  avoids hydration mismatch). Empty server snapshot, real client snapshot, cached for stable refs.
- **Tailwind v4 scans git-tracked files** — `git add` new files before judging missing styles; verify
  via `npm run build`, not the dev content cache.
- **e2e under dev compiles on first hit** — `expect` timeout is 15s, per-test 60s. The Write trace
  e2e is a **render smoke** (full freehand sweep is too slow/flaky for CI); trace logic is covered by
  unit tests + a local sweep.
- **ASR is best-effort, never a gate** — Speak L1 (and any device w/o ASR, incl. iPad Safari) uses
  self-rate; L2 adds ASR + always-present "I said it" override. Nothing recorded/transmitted.
- **`getByRole` name is a substring match** — e2e `I tap "X"` uses `link.or(button).first()` to avoid
  label collisions and post-nav races.
- **Vercel native Git integration does NOT fire** (project made via CLI) — deploys run via the CI
  `deploy` job, not Vercel webhooks.

## Supabase (task 17)

- Schema in `supabase/migrations/0001_initial_schema.sql`; **generated** `supabase/seed.sql` from the
  Phase 1 mock data. Regenerate with `npx tsx supabase/seed/generate-seed.ts`. See `supabase/README.md`.
- The Supabase CLI is a dev-only tool (via `npx`/global) — **not** an app dependency, so CI/Vercel
  builds are unaffected and nothing touches `localStorage` persistence yet.
- Schema **was applied to the hosted free-tier project** by the owner (`supabase db push` of
  migration 0001 succeeded — schema validated). Migration `0002_auth_policies.sql` (task 18) still
  needs `supabase db push` to the hosted DB.

## Parent auth + PIN (task 18)

- `/parent` is the only Supabase-backed surface; **child mode stays 100% localStorage.** Entry is a
  discreet lock icon on the chooser (`src/app/page.tsx`).
- Clients in `src/lib/supabase/{client,server,middleware}.ts` (`@supabase/ssr`, cookie sessions), all
  **env-guarded** — empty `NEXT_PUBLIC_SUPABASE_*` ⇒ "not configured" ⇒ signed-out passthrough, so
  dev:demo + e2e never touch Supabase. Root `middleware.ts` refreshes the session, guards `/parent`,
  and **drops the PIN cookie on `/child`** (re-prompt on return).
- Server actions in `src/app/parent/actions.ts` (`parentSignIn`/`parentSignOut`/`submitPin`). PIN is
  scrypt-hashed per parent (`src/lib/auth/pin.ts`, server-only), set on first `/parent` visit.
  `PinGate` (`src/components/parent/`) does setup then entry. Parent strings are Vietnamese in `src/i18n/`.
- **One-time setup before it works:** create the parent in the Supabase dashboard and backfill
  `children.parent_id` — see `supabase/README.md`. Set the env vars locally + in Vercel.
- Two new deps: `@supabase/supabase-js`, `@supabase/ssr` (pre-approved under "Supabase" in the stack).

## Persistence on Supabase (task 19)

- `src/lib/storage.ts` keeps the **same synchronous API** (`useChildProgress`, `recordHutResult`,
  `effectiveLevel`, `setSkillLevel`, `clearAllProgress`) but routes to one of two backends:
  `src/lib/progress/remote.ts` (Supabase, when configured) or localStorage (when not). Reads stay sync
  via an in-memory cache filled by `ensureProgressLoaded`; writes update the cache optimistically then
  write through. Pure award/mastery transition lives in `src/lib/progress/apply.ts` (unit-tested).
- New tables in `migrations/0003_progress_tables.sql`: `earned_stickers`, `hut_progress`, `theme_mastery`
  (+ `learning_attempts` now populated per round). **Push it: `supabase db push`** before the live site
  can save progress.
- **Child mode requires a parent session when Supabase is configured.** The gate is a Node-runtime
  `src/app/child/[childId]/layout.tsx` — NOT middleware. **Gotcha learned:** `process.env.NEXT_PUBLIC_*`
  is unreliable inside Edge middleware (empty in dev), so auth gating that depends on "is Supabase
  configured" must live in a Node server component, not middleware. Middleware still refreshes the
  session + clears the PIN cookie on `/child`.
- Known minor: per-skill level briefly shows the profile default for ~1 frame while the remote load
  resolves, then corrects (huts rebuild their question set). Fine for now; SSR-loading the level is a
  later polish.

V2 candidates (tracked at the bottom of `00-index.md`): original SVG mascot art to replace the emoji
stickers; a child-facing sticker-set picker.

## Suggested kickoff for the next session

> Read `docs/handoff.md` (this file). Phases 1–3 (tasks 01–26) are complete and deployed; all four
> islands are filled and Animals/Food are deepened to 24 words each. Grammar G1–G6 are done (island MVP,
> prepositions + SVG scenes, the Observe intro beat, per-item attempt logging, spaced review + VN-L1
> weighting, parent dashboard grammar section). Build **G7 — scale up: Movers/Flyers grammar** per
> [`docs/tasks/00-index.md`](tasks/00-index.md): past simple, comparatives, "going to" (sentence-build +
> scenes, reusing G2's scene support for the spatial ones); plus this/that, can-for-ability, there
> is/are. Same mechanics as G1-G2, more choices/sentence prompts by level — likely session-sized as
> G7a/G7b rather than one PR. Branch off `main`, plan briefly, implement, verify
> (tsc/lint/unit/build/e2e), open a PR, watch CI, merge (auto-deploys). Keep the per-task PR workflow.
> (Or do task 27, the real-iPad pass, on-device — including a visual check of the new G6 dashboard
> section, which hasn't been verified live yet.)
