# OLA English Adventure — handoff

Read this first to continue the project in a new session. Source of truth for the
plan is [`docs/tasks/00-index.md`](tasks/00-index.md); the *why* is
[`docs/game-design-spec.md`](game-design-spec.md); the rules are [`CLAUDE.md`](../CLAUDE.md).

## Status (2026-06-25)

**Phase 1 vertical slice is COMPLETE and deployed.** Tasks **01–16 all ☑**.
**Phase 2 started: tasks 17 (schema + seed) ☑ and 18 (parent auth + PIN gate) ☑.**
Child mode is still 100% localStorage; only `/parent` uses Supabase. Next: 19 (migrate persistence).

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

## What's next

Phase 1 is done. Options, in rough priority:

1. **Test on the real iPad** (URL above → Add to Home Screen) before building more. Verify content
   emoji render on iPadOS.
2. **Phase 3 PWA early (task 26)** — manifest `display: standalone` + locked viewport so it launches
   fullscreen like a native app on iPad. Small, high-value for the test.
3. **Phase 2:** 17 Supabase schema → 18 parent auth + PIN → 19 migrate persistence off localStorage →
   20 Flyer (L3) sentence mechanics → 21 second theme + interleaving.

V2 candidates (tracked at the bottom of `00-index.md`): original SVG mascot art to replace the emoji
stickers; a child-facing sticker-set picker.

## Suggested kickoff for the next session

> Read `docs/handoff.md`. Phase 1 (tasks 01–16) is complete and deployed. Continue with **<task 26
> PWA / task 17 Supabase>** — branch off `main`, plan briefly, implement, verify (tsc/lint/unit/
> build/e2e), open a PR, watch CI, and merge (auto-deploys). Keep the per-task PR workflow.
