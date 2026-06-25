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

- ☑ **01 — Project scaffold.** Next 16 + TS strict + Tailwind v4 + vitest + playwright-bdd, mirroring
  `lla`. `dev` + `dev:demo` scripts, `cn.ts`, path aliases, lint. App boots to a placeholder home.
  *(Done — branch `task/01-project-scaffold`; tsc/lint/unit/build/e2e green.)*
- ☑ **02 — Design tokens & global styles.** Palette + fonts (Fredoka/Nunito via `next/font`) + 8px
  spacing as CSS vars in `globals.css`; Tailwind v4 `@theme`. `TabletShell` + `ScreenHeader` chrome.
  Add the **global native-feel CSS** (`-webkit-tap-highlight-color: transparent`, `touch-callout`,
  `user-select: none`, `overscroll-behavior: none`, `touch-action: manipulation` on interactives) —
  see CLAUDE.md "Performance & native feel". Verify contrast ≥ 4.5:1.
  *(Done — PR #2; contrast-safe `*-dark` tokens; no star counter, stickers-only.)*
- ☑ **03 — Shared types, mock children & sticker bank.** `src/lib/types.ts`: `Theme`, `Skill`
  (`listen|speak|read|write`), `Level` (`starter|mover|flyer`), `Attempt`, `ThemeProgress`,
  `CharacterSticker`/`StickerRarity`/`StickerSet`, `ChildProfile` (per-skill level map). Mock
  `children.ts` (Milo/Sunny). **`data/stickers/sticker-bank.ts` — 30 boy + 30 girl original mascot
  stickers** with rarity tiers (legendary = theme-master). Unit-tested (bank integrity).
- ☑ **04 — Speech + ASR + sound wrappers.** `speech.ts` (SpeechSynthesis, SSR-guarded, **never
  `.cancel()`**, `onEnd` even when unavailable so callers don't hang); `asr.ts` (SpeechRecognition,
  `looseMatch` for accented speakers, **graceful degrade** to null/self-rate); `sounds.ts` (**Web
  Audio API** — synthesized chimes, **unlock `AudioContext` on first gesture**, no `<audio>` tags).
  Unit-tested (matching + SSR guards). *(Done — PR #4.)*
- ☑ **05 — UI primitives.** `AudioButton` (coral, ≥88px, auto-play on mount), `ChoiceCard` (≥128px,
  **press feedback on `pointerdown`**, idle/correct/dimmed/revealed states), `ProgressDots`,
  `StickerBadge` (puffy/locked, rarity ring), `Button` (primary/secondary, tactile). Animate
  **`transform`/`opacity` only**; cards memoized; reduced-motion aware. *(Done — PR #6. Fixed a
  hydration mismatch: shuffle on the client after mount, never during SSR.)*
- ☑ **06 — Sticker book home + island map.** `/` chooser → `/child/[id]` sticker book (collection
  grid, earned vs dashed-locked, Play CTA) → `/child/[id]/map` island map (Weather unlocked, rest
  dashed/locked). Mock progress (`data/mock-progress.ts`), `data/themes.ts`. Cross-screen
  `@view-transition: navigation auto` (graceful degrade; reduced-motion off). Island route is a
  task-07 stub. *(Done — PR #7.)*
- ☑ **07 — Island screen (4 huts).** `/child/[id]/island/[themeId]` → theme header + 2×2 hut grid
  (Listen/Speak/Read/Write), each with skill icon, the child's per-skill **level chip**, and a done
  check; all huts tappable (mastery gates the milestone, not play). All-done → master-sticker banner.
  `[skill]` route is a task-08/09 stub. *(Done — PR #8.)*
- ☑ **08 — Engine core (the heart).** `src/lib/engine/`: pure `hut-machine.ts` reducer (round
  sequencing, **scaffold-and-reveal** — 1st miss dims tapped + replays, 2nd reveals + narrates;
  **no-fail retry**; 3-in-a-row **auto-ease** to 2 choices; client-shuffle via `prepare` to avoid
  SSR mismatch) + `use-hut-engine.ts` hook (audio/chime/advance side effects). `choices.ts` (rule 8)
  + `scoring.ts` (rule 9, 80% mastery) from PR #5. Reducer heavily unit-tested. *(Done — PR #10.)*
- ☑ **09 — Listen hut (L1+L2).** End-to-end through the engine: hear word → tap picture (Starter = 2
  choices, Mover = 3), labels hidden so reading can't shortcut it. `hut-player.tsx` (reusable round
  UI + result) + `listen-hut.tsx` + Weather content. e2e plays a full hut to the sticker result.
- ☑ **10 — Read hut (L1+L2).** Read the printed word → tap the matching picture. Starter = audio
  support + 2 choices; Mover = **no audio**, 3 choices; picture labels hidden so the word must be
  read. Reuses `hut-player` (new `promptMode="word"` + `speakPrompts`) and a shared
  `buildPictureQuestions`. e2e plays it through. *(Done — PR #11.)*
- ☑ **11 — Write hut (L1+L2).** L1 (Starter): **trace** a dashed letter guide — SVG path with
  auto-sampled waypoints, drag to light them (forgiving radius), all hit → done (no-fail practice).
  L2 (Mover): **tap letter tiles to spell** (picture + first-letter hint; wrong word shakes & clears,
  pure spelling logic unit-tested). Shared `HutResult` extracted; `animate-shake` keyframe added.
  e2e sweeps the trace pad through all rounds. *(Done — PR #13.)*
- ☑ **12 — Speak hut (L1+L2).** Hear the model → repeat. Starter (+ any no-ASR device) = **self-rate
  stars** (no mic). Mover w/ ASR = `listenOnce` + `looseMatch` with an **always-present "I said it"
  override**, degrading to self-rate. Nothing recorded/transmitted. `[skill]` route now serves all
  four huts (placeholder retired). e2e completes via self-rate. *(Done — PR #14.)*
- ☑ **13 — Weather theme content.** `data/themes/weather.ts`: 9 words (sunny/rainy/cloudy/windy/hot/
  cold/snowy/stormy/foggy) with emoji + `vi`. **Per-level pools** via `weatherWordsForLevel` — Starter
  = 6-word concrete core, Mover/Flyer = full 9 — wired into all four huts (distractors drawn from the
  level pool). can-do lives on the theme. Flyer sentence content is task 20. *(Done — PR #17.)*
- ☑ **14 — Reward & sticker award flow (one-by-one + motivation).** `RewardOverlay` (Framer,
  reduced-motion aware) over the activity on hut completion: names the win ("You earned Finn!"),
  celebrates a theme-master legendary if earned, and **teases the next sticker**. `HutResult` records
  the result once and shows it. Award ordering = pure `pickNextSticker` (common→rare→epic; legendary
  for master). *(Done — PR #15.)*
- ☑ **15 — Per-child persistence (saved sticker state).** `storage.ts` — localStorage keyed by child:
  ordered `earnedStickerIds`, `completedHuts`, `masteredHuts`, `masteredThemes`. `recordHutResult`
  awards one-by-one + idempotent; `nextStickerToCollect`; `clearAllProgress` dev reset on the chooser.
  Read reactively via `useChildProgress` (useSyncExternalStore → no hydration mismatch); the three
  screens now read real progress. e2e: earn → reload → still saved. Supabase migration is task 19.
- ☑ **16 — Child picker + dev level toggle.** Chooser picks a child (task 06); added a per-skill
  **Levels (dev)** toggle on the sticker book that flips Starter↔Mover, **saved per child** in the
  progress store and read by all huts + the island chip via `effectiveLevel`. No auth needed.
  *(Done — PR #18.)* **Phase 1 complete — hand the iPad to a kid and they finish a hut alone.**

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

## V2 candidates (tracked, not now)

- ☐ **Original SVG mascot art for the sticker bank.** Replace the Phase-1 emoji placeholders in
  `src/data/stickers/sticker-bank.ts` with original drawn SVG characters (boy + girl sets, 30 each),
  keeping the existing `id`s stable so earned stickers don't reset. Verify rendering on the real iPad.
- ☐ **Sticker-set picker in settings.** Let a child switch their default `stickerSet` (boy/girl) —
  it's a soft default today, not exposed in UI yet.

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
