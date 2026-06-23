# Task 01 — Project scaffold

Stand up the Next.js app so everything after it has a home. No game logic yet — just a booting app,
the toolchain, and conventions, mirroring the proven `lla` setup.

## Goal

`npm run dev` boots a Next 16 App Router app in TypeScript strict mode with Tailwind v4 wired, the
test toolchain installed, and a placeholder home screen at `/`. CI-style checks (`tsc`, lint, unit,
e2e) all run green on an empty suite.

## Scope (do this)

1. **Init Next 16 App Router + TS** in the repo root (`~/Code/adventure-english`, already a git repo
   with `docs/`). Use the App Router, `src/` dir, no `experimental` extras.
2. **package.json** — name `ola-english-adventure`, private. Scripts mirroring `lla`:
   - `dev`, `build`, `start`, `lint`
   - `dev:demo` — runs `dev` with empty `NEXT_PUBLIC_SUPABASE_*` so child routes never bounce to
     auth (Supabase arrives in Phase 2; this keeps the demo path open now).
   - `test:unit` (vitest run), `test:unit:watch`, `test:e2e` (bddgen && playwright test),
     `test:e2e:ui`, `test` (unit then e2e).
3. **Tailwind v4** via `@tailwindcss/postcss`; empty `@theme` block in `globals.css` (tokens land in
   task 02). Confirm a utility class renders.
4. **Toolchain** (devDeps, versions aligned with `lla`): `vitest` + `@vitejs/plugin-react` +
   `jsdom` + `vite-tsconfig-paths`; `@playwright/test` + `playwright-bdd`; `eslint` +
   `eslint-config-next`; `@types/*`; `sharp`. Add `lucide-react` + `framer-motion` as deps now (used
   from task 05 on).
5. **`src/lib/cn.ts`** — the `clsx`-free className helper (copy `lla`'s; no new dep).
6. **Path alias** `@/*` → `src/*` in `tsconfig.json` (strict already on).
7. **Placeholder home** `src/app/page.tsx` (server component) — a centered "OLA English Adventure"
   title using a Tailwind class, `min-h-dvh`. Just proves the stack renders.
8. **One smoke test each:** a trivial vitest unit test (`cn` merges classes) and a playwright-bdd
   feature that loads `/` and sees the title. Establishes the e2e contract harness early.
9. **`.gitignore`, `.eslintrc`/flat config, `vitest.config.ts`, `playwright.config.ts`** as in `lla`.

## Out of scope (don't)

- Any game UI, engine, data, tokens, or Supabase. No `any`.
- Don't commit to `main` — work on a branch and open a PR.

## Key decisions / notes

- **Node 26 is installed**; Next 16 + React 19 are fine (same as `lla`).
- Keep `dev:demo` even though there's no Supabase yet — it's the route we'll preview kid screens on,
  and wiring it now avoids retrofitting later.
- Mirror `lla`'s versions to avoid surprises (Next 16.2.x, React 19.2.x, Tailwind v4, vitest 4,
  playwright-bdd 9). Reference: `~/Code/lla-task-07/package.json`.
- Tailwind v4 only scans **git-tracked** files — `git add` new files before judging missing styles,
  and verify via `npm run build` (not the dev content cache). (Builder memory:
  `project_tailwind_v4_content_detection`.)

## Acceptance criteria

- [ ] `npm run dev` serves `/` showing the title; no console errors.
- [ ] `npm run dev:demo` boots with empty Supabase env and serves `/` identically.
- [ ] `npx tsc --noEmit` passes; `npm run lint` passes.
- [ ] `npm run test:unit` passes (the `cn` test).
- [ ] `npm run test:e2e` passes (the `/` smoke feature).
- [ ] Strict mode on; no `any` anywhere; `@/*` alias resolves.

## Wrap-up

Summarize files created, the exact dependency versions installed, anything that diverged from `lla`,
and confirm all five checks are green. Then we move to task 02 (design tokens).
