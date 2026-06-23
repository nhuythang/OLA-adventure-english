# Task index — OLA English Adventure

One numbered task per Claude Code session. Each is sized to fit a single session and ships behind a
branch → PR per the workflow in `CLAUDE.md`. **Build the vertical slice first** (Weather, end-to-end)
so there's something playable to test on the kids before generalizing.

Source of truth for *why*: [`../game-design-spec.md`](../game-design-spec.md).

Legend: ☐ not started · ◐ in progress · ☑ done

---

## Phase 1 — Vertical slice (mock data, no backend)

> Goal: one theme (**Weather**), all 4 huts, **Levels 1 + 2**, sticker book (4 + 1 stickers),
> per-skill level via dev toggle, `localStorage` progress. Prove the core loop and the no-reading bet.
>
> **Build order is deliberately vertical-slice-first:** stand up scaffold + tokens + types, then
> build *one hut (Listen) end-to-end* through the engine before adding the other three huts.

- ☐ **01 — Project scaffold.** Next 16 + TS strict + Tailwind v4 + vitest + playwright-bdd, mirroring
  `lla`. `dev` + `dev:demo` scripts, `cn.ts`, path aliases, lint. App boots to a placeholder home.
- ☐ **02 — Design tokens & global styles.** Palette + fonts (Fredoka/Nunito via `next/font`) + 8px
  spacing as CSS vars in `globals.css`; Tailwind v4 `@theme`. `TabletShell` + `ScreenHeader` chrome.
  Add the **global native-feel CSS** (`-webkit-tap-highlight-color: transparent`, `touch-callout`,
  `user-select: none`, `overscroll-behavior: none`, `touch-action: manipulation` on interactives) —
  see CLAUDE.md "Performance & native feel". Verify contrast ≥ 4.5:1.
- ☐ **03 — Shared types & mock children.** `src/lib/types.ts`: `Theme`, `Hut`, `Skill`
  (`listen|speak|read|write`), `Level` (`starter|mover|flyer`), `RoundItem`, `Attempt`, `Sticker`,
  `ChildProfile` (per-skill level map). Mock `children.ts` + dev level toggle scaffold.
- ☐ **04 — Speech + ASR + sound wrappers.** `speech.ts` (SpeechSynthesis, SSR-guarded, **never
  `.cancel()`**, `onEnd` callback); `asr.ts` (SpeechRecognition, loose match, **graceful degrade** to
  self-rate); `sounds.ts` (**Web Audio API** — pre-decode chimes to `AudioBuffer`, **unlock the
  `AudioContext` on first user tap**, no `<audio>` tags). Unit-tested with mocks.
- ☐ **05 — UI primitives.** `AudioButton` (purple, ≥88px, auto-play on mount), `ChoiceCard` (≥72px,
  **press feedback on `pointerdown` ≤100ms**, ≥8px gap), `ProgressDots`, `StickerBadge`, `Button`.
  Animate **`transform`/`opacity` only**; memoize cards; reduced-motion aware. See CLAUDE.md
  "Performance & native feel".
- ☐ **06 — Sticker book home + island map.** Sticker book is the landing screen (locked/unlocked
  slots). Map shows theme islands; only unlocked islands are enterable. Mock progress. Use the
  **View Transitions API** for screen-to-screen navigation (graceful degrade) — CLAUDE.md "native feel".
- ☐ **07 — Island screen (4 huts).** Enter an island → 4 hut cards (Listen/Speak/Read/Write) with
  done/available state and the hut sticker each grants.
- ☐ **08 — Engine core (the heart).** `src/lib/engine/`: round sequencing, **scaffold-and-reveal**
  (1st miss = replay + dim one; 2nd = highlight + narrate), **no-fail retry**, 3-miss auto-ease,
  **80% mastery** decision, specific-feedback hooks, `reviewPool` param (empty until P2). Heavily
  unit-tested. Port/generalize from `lla`'s lesson engine. **Verify the scaffold guardrail first.**
- ☐ **09 — Listen hut (L1+L2).** First hut end-to-end through the engine. L1: hear word → 2 picture
  choices; L2: 3 choices, no hint. e2e: complete a hut, earn its sticker.
- ☐ **10 — Read hut (L1+L2).** L1: match printed word → picture; L2: read word (no audio) → tap
  picture.
- ☐ **11 — Write hut (L1+L2).** L1: trace letter/word along a guided finger path (SVG path +
  pointer tracking); L2: drag letter tiles to spell (picture + first-letter hint).
- ☐ **12 — Speak hut (L1+L2).** L1: hear model → repeat → tap stars to self-rate (no mic). L2: ASR
  loose match **with always-present "I said it" override**; degrades to self-rate. Privacy: nothing
  stored/transmitted.
- ☐ **13 — Weather theme content.** `data/themes/weather.ts`: word lists per level (sunny, rainy,
  windy, cloudy, snowy, hot, cold…), pictures (Lucide/emoji content), distractors, can-do statement.
  Both L1 + L2.
- ☐ **14 — Reward & sticker award flow.** Hut-complete → hut sticker overlay (not a screen). All 4
  huts → master sticker + unlock-next-island celebration. Specific feedback, reduced-motion fallback.
- ☐ **15 — localStorage persistence.** Per-child: hut/theme progress, earned stickers, per-skill
  level, attempts. Survives refresh. Keyed by child id. Clear-progress dev affordance.
- ☐ **16 — Child picker + dev level toggle.** Pick a mock child; per-skill level toggle for testing
  (Starter/Mover) without auth. **Phase 1 done = hand the iPad to a kid and they finish a hut alone.**

## Phase 2 — Level 3 + second theme + Supabase

- ☐ **17 — Supabase schema + seed.** `english_themes`, `english_items`, `huts`, `learning_attempts`,
  `stickers`, per-skill `child_skill_levels`. Seed scripts from the Phase 1 mock data.
- ☐ **18 — Parent auth + PIN gate.** Supabase email+password login; PIN re-entry to enter parent
  area from child mode.
- ☐ **19 — Migrate persistence to Supabase.** Move progress/stickers/attempts off localStorage;
  keep mock files as seeds. Per-child, multi-device.
- ☐ **20 — Level 3 (Flyer) mechanics.** Listen: sentence → tap scene (4 choices). Read: sentence →
  true/false or matching picture. Write: build a sentence from word tiles. Speak: answer a spoken
  question in a short phrase (ASR + override).
- ☐ **21 — Second theme + interleaving.** Add a second island; engine mixes ~70% current + ~30%
  review items from mastered themes (active recall). Wire the `reviewPool`.

## Phase 3 — Placement, streaks, dashboard, PWA, deploy

- ☐ **22 — Per-skill placement.** 3-question placement sets each skill's level; parent/teacher can
  adjust. A child can be Flyer at Listen, Starter at Write.
- ☐ **23 — Streak stickers.** Consecutive-day bonus sticker. Habit nudge, no pressure, no penalty
  for gaps.
- ☐ **24 — Parent/teacher dashboard.** Per-skill progress, sticker-book view, "what did my child
  learn." Vietnamese surface. PIN/auth-gated.
- ☐ **25 — Wordlist source-of-truth import.** Import the real Cambridge YLE Starters/Movers/Flyers
  lists (or OLA term lists) as the content source; reconcile Weather + future themes against it.
- ☐ **26 — PWA.** **Serwist** service worker, manifest with **`display: "standalone"`**, locked
  viewport (`viewport-fit=cover, maximum-scale=1, user-scalable=no`) + safe-area insets, offline
  preload of theme audio + images, install prompt. See CLAUDE.md "Performance & native feel".
  (Watch the stale-cache gotcha noted in the builder's memory.)
- ☐ **27 — Deploy to Vercel.** Production deploy, real-iPad test pass, env wiring.

---

## Definition of done (MVP / end of Phase 3)

- Child opens the sticker book, picks an island, completes huts across all 4 skills, earns hut
  stickers and a master sticker, unlocks the next island — **without an adult reading to them.**
- Wrong answers scaffold (never auto-reveal early) and never produce a fail state.
- Per-skill leveling works; a placement check sets it and parent/teacher can adjust.
- Parent sees per-skill progress in a Vietnamese dashboard.
- Installs as a PWA on iPad, runs fullscreen, static screens work offline.
- Deployed to Vercel on the free tier.

## Risks carried from the spec (§9) — keep visible

1. **Speak/ASR unreliable** on VN-accented young voices → L1 self-rate, L2–L3 loose match + override.
2. **Wide age band (4–7)** → per-skill leveling + placement are essential, not optional.
3. **Privacy** → on-device speech only; nothing stored/transmitted.
4. **Content alignment** → "Starter/Mover/Flyer" only holds with a real Cambridge YLE source (task 25).
