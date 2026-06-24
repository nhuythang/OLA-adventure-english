# CLAUDE.md — OLA English Adventure

Canonical context for Claude Code. Read this at the start of every session before doing anything else.

---

## Project mission

A **sticker-collecting English game** for children aged **4–7**, reinforcing the four skills
(Listening, Speaking, Reading, Writing) at home in short, low-pressure sessions. Vocabulary is
aligned to the **Cambridge YLE progression: Starters → Movers → Flyers** (the OLA / ILA Cambridge
curriculum). Built for **the builder's two children**, not a commercial product.

The game does **not** replace class. It reinforces the current term's wordlist and gives the parent
visible proof of progress (a filling sticker book).

Optimize, in order:
1. The kids actually using it and enjoying it (the pre-reader is the hardest constraint).
2. Solo maintainability in evenings.
3. Free-tier deployment (Vercel + Supabase free).

Full design rationale lives in [`docs/game-design-spec.md`](docs/game-design-spec.md). This file is
the operational summary; the spec is the source of truth for *why*.

**Non-goals for v1:** no points/coins/lives, no leaderboards, no timers, no social features, no
in-app purchases, no ads, no AI-generated content / paid APIs.

---

## Who this is for (personas)

| Persona | Profile | Job-to-be-done |
|---|---|---|
| **Pre-reader** (4–5, "Starter") | Cannot read instructions; short attention; taps and listens. | "Let me succeed without anyone reading to me." |
| **Emergent reader** (6–7, "Mover/Flyer") | Recognizes letters and short words; wants to feel "big." | "Let me show I can read and spell, not just tap pictures." |
| **Parent** | Wants visible progress, safety, no ads, short sessions. | "Show me my child learned something today." |
| **OLA teacher** | Wants game vocabulary to match the Cambridge level taught in class. | "Reinforce this week's wordlist, don't contradict it." |

The **pre-reader drives most design rules.** No screen may be gated behind reading.

---

## Language

- **Child gameplay: English** (the content being taught).
- **Parent / teacher surfaces (placement, settings, dashboard): Vietnamese.**
- All UI strings live in `/src/i18n/`. Never hardcode user-facing strings in components.
- Audio via browser `SpeechSynthesis`: English content (`en-US`), Vietnamese parent/teacher prompts
  (`vi-VN`). Pick voices by `lang`.

---

## Core concept & loop

- Each **theme is a map island**. The **sticker book is the home screen** the child is proud to open.
- Inside an island are **4 skill huts**: Listen / Speak / Read / Write.
- A hut = **3–5 short rounds**. Finish a hut at **≈80% correct → earn 1 hut sticker** (4 per island).
- Finish **all 4 huts → theme-master sticker + next island unlocks.**
- Below 80%: offer an **easier review round**, never block.
- **Difficulty is per-skill level**, not per-game: a child can be Flyer at Listening, Starter at
  Writing. Level set once by a 3-question placement; adjustable by parent/teacher.

```
Sticker book (home) → pick island → choose hut → 3–5 rounds → hut sticker → all 4 huts → master sticker → unlock next island
```

A hut is ~2–3 minutes. A full island is one or several sittings. Nothing forces completion.

---

## Skill mechanics × levels

| Skill | L1 — Starter (~4–5, Pre-A1) | L2 — Mover (~6, A1) | L3 — Flyer (~7, A2) |
|---|---|---|---|
| **Listen** | Hear word → tap picture (2 choices) | Hear word → tap picture (3 choices, no hint) | Hear sentence → tap the scene (4 choices) |
| **Speak** | Hear model → repeat → tap stars to self-rate | Repeat word; ASR with generous matching | Answer a spoken question in a short phrase |
| **Read** | Match printed word to picture | Read word (no audio) → tap picture | Read sentence → true/false or matching picture |
| **Write** | Trace letter/word on a guided path | Drag letter tiles to spell (picture + 1st-letter hint) | Build a sentence from word tiles |

**Speak / ASR decision (the biggest UX fork — settled):** use browser `SpeechRecognition` where
available, but it must **never block a child**. L1 is always echo-and-self-rate (no mic). L2–L3 try
ASR with very loose matching **plus an always-present "I said it" override**. A failed/absent
recognizer silently degrades to self-rate. Nothing recorded, nothing transmitted (see Safety).

---

## Pedagogy engine rules (non-negotiable — the heart of the app)

The engine in `src/lib/engine/` must obey these. They encode what a good tutor does. (Ported and
generalized from the builder's existing `lla` lesson engine.)

1. **One task per screen.** Exactly one target item. Never two decisions at once.
2. **Listen first.** Every instruction is spoken aloud on mount; no reading required to play.
3. **Scaffold before answer — never auto-reveal early.**
   - **1st wrong tap:** do not reveal. Replay the audio + dim one wrong choice. No star.
   - **2nd wrong tap:** give the foothold — highlight the correct choice with a short spoken
     narration ("This one is *sunny*."). No star.
   - "A foothold, not the summit." The answer is never handed over on the first miss.
4. **No fail state, no timers.** Wrong → scaffold → retry. Repeated misses (3) auto-ease difficulty
   for that round; they never end it. No "game over," no point penalty.
5. **Specific feedback, not hollow praise.** Name the win ("You found the **red** one!"). Celebrate
   at the **milestone** (theme mastered), not on every tap.
6. **Active recall + interleaving.** A session mixes ~70% current theme + ~30% review items from
   earlier mastered themes. (Review pool wired in Phase 2.)
7. **Mastery gates the milestone, not the play.** A mastered hut can be replayed for fun; earned
   stickers stay earned. A theme is "mastered" at the can-do threshold, then a clear summary — no
   endless grind.
8. **Randomize the correct answer's position every question.** Shuffle the choices (Fisher–Yates) so
   the answer is never learnable as a fixed position. Shuffle **once per round item and keep the
   order stable across that question's retries** — options must not jump after a wrong tap, or the
   scaffold becomes disorienting. Re-shuffle only for the next question.
9. **Only a first-try-correct tap counts toward accuracy/mastery.** A correct tap on the 2nd choice
   (or after the scaffold reveals the answer) completes the round but does **not** count as correct —
   this stops a child from tapping randomly until they hit it and "earning" mastery. `Attempt.
   firstTryCorrect` is the single source of truth for scoring; hut mastery (≈80%) is computed over
   first-try-correct only. (Completing the round still earns the hut's sticker — no fail state.)

> Anti-pattern to prevent: a "tap-fast-for-stars" quiz with no scaffold, or hiding the answer
> inside the hint. The scaffold-and-reveal flow (rule 3) is the guardrail — verify it first in any
> engine change. Rules 8–9 are the other half: random position + first-try-only scoring stop
> guess-spamming from masquerading as learning.

---

## UI / UX & accessibility (hard rules for ages 4–7)

- **Touch targets:** answer cards ≥ **72px**; audio button ≥ **88px**. **≥ 8px gaps** between
  adjacent targets (a 4-year-old's tap must not catch two).
- **Audio-first:** every screen has a tap-to-hear replay control (purple speaker convention) and
  auto-plays its prompt on mount. Pre-readers must never be blocked by text.
- **Immediate press feedback (~100ms):** scale 0.96→1.0 spring on touch — faster than, and separate
  from, the correct-answer flash (~200ms).
- **Color is never the only signal.** Correct = green **+ check icon + chime + bounce**, not color
  alone (supports color-blind and pre-literate kids).
- **Respect `prefers-reduced-motion`** for any continuous/large movement (card flips, advancing
  animations, confetti): reduce to a simple fade. Use Framer `useReducedMotion`.
- **Icons are SVG (Lucide), not emoji.** *Exception:* emoji is fine as **teaching pictures** and
  **avatar content** — never as a structural/navigation icon. Verify any content emoji on the real
  iPad (renders differently than Chrome).
- **One primary action per screen.** Mobile-first, `min-h-dvh`, no nested scroll, no horizontal
  scroll at 360px width.
- **Minimal text on Level 1 screens.**
- **No text-only navigation in child mode** — back + home buttons only, each with an icon.

Carry these from the spec §8 verbatim; they are the no-reading bet.

---

## Performance & native feel

The game must feel like a **native app on iPad**, not a web page — but we achieve this with the DOM,
**not** a game engine (Canvas/WebGL/Phaser are explicitly rejected; they'd discard accessibility and
the audio-first flow for zero benefit on a tap-game). Native feel = *instant touch response +
jank-free animation + no browser chrome.* Every screen is built to these rules; cross-cutting, so
they live here rather than in one task.

**Touch response (the biggest perceived-speed win):**
- Fire press feedback on **`pointerdown`**, not `click` (≤100ms scale `0.96→1.0`). Click waits for
  the gesture to resolve; pointerdown is immediate. This is separate from the ~200ms correct flash.
- `touch-action: manipulation` on interactive elements + a locked viewport (below) to kill the
  ~300ms tap delay and double-tap zoom.
- Strip web artifacts globally: `-webkit-tap-highlight-color: transparent`,
  `-webkit-touch-callout: none`, `user-select: none`.
- **Drag & trace (Write hut) use native Pointer Events** (`pointerdown/move/up`) — unified
  touch+mouse, no `@dnd-kit` dependency.

**Jank-free animation (hold 60fps, 120fps on ProMotion):**
- Animate **only `transform` and `opacity`** (compositor/GPU thread; no layout/paint). Never animate
  `width`, `top`, `margin`, or `box-shadow` for movement. Keep Framer Motion props to
  `x/y/scale/rotate/opacity`.
- Keep animation **out of React's render path** — let Framer own the tween; never drive a moving
  element via per-frame `setState`.
- **Memoize option cards** so a single card's flash doesn't re-render the whole screen. This is where
  React games actually jank.
- `content-visibility` / CSS containment on off-screen island & hut cards.

**Screen transitions:** use the **View Transitions API** (`document.startViewTransition`, Safari 18+ /
iPadOS, supported by Next 16) for native-style cross-fades / shared-element morphs between screens.
Degrade gracefully where unsupported.

**Audio with no lag (critical on iOS):**
- **Unlock the Web Audio `AudioContext` on the first user tap** — iOS Safari starts it suspended; an
  unresumed context makes the first chime silent or late.
- **Sound FX via Web Audio API** (tiny `sounds.ts`): pre-decode chimes into `AudioBuffer`s at load
  and play `AudioBufferSourceNode`s (sub-ms). Never use `<audio>` tags for game feedback. (Speech
  stays on `SpeechSynthesis`.)

**Fullscreen, app-like shell (PWA — Phase 3):**
- Manifest **`display: "standalone"`** → no address bar; launches from home screen like native.
- Lock the viewport so kids can't scroll/bounce/pinch-zoom:
  `<meta viewport ... viewport-fit=cover, maximum-scale=1, user-scalable=no>` +
  `html,body { overscroll-behavior: none }` (no rubber-band / pull-to-refresh).
- Respect safe-area insets (`env(safe-area-inset-*)`).
- **Preload assets** (`next/font`, theme images, decoded audio) so there's no pop-in mid-game.

**iPad reality check:** `SpeechRecognition` (ASR) is unreliable/often unavailable on iOS Safari — so
the L2–L3 Speak hut treats ASR as best-effort only; the "I said it" override + degrade-to-self-rate
is the **primary** path on iPad, never a fallback afterthought. `SpeechSynthesis` (TTS) works well.

Honoring `prefers-reduced-motion` (see UI/UX rules) is also part of native feel — a well-built native
app respects the OS motion setting.

---

## Reward & sticker system

- **Per hut:** 1 themed sticker (4 collectible per island).
- **Per theme mastered:** 1 special master sticker + next island unlocks.
- **Streak stickers:** small bonus for consecutive days — habit nudge, no pressure (Phase 3).
- **Stickers are the only currency.** No points, coins, lives, leaderboards.
- The **sticker book is the home/landing screen**, persistent across sessions (localStorage in
  Phase 1, Supabase keyed to child profile in Phase 2).

Definitions: *achievement* = one hut mastered; *milestone* = all 4 huts of a theme mastered.

---

## Tech stack

- **Next.js 16** (App Router) + **TypeScript** (strict, **no `any`**)
- **Tailwind CSS v4**
- **Rendering: DOM + inline SVG** — no Canvas/WebGL/game engine (see Performance & native feel)
- **Framer Motion** — reward/feedback animation only; don't over-animate
- **Engine/game state: React `useReducer` + Context** (hand-rolled state machine) — no Redux/Zustand/XState
- **Audio:** `SpeechSynthesis` (TTS) + `SpeechRecognition` (ASR, best-effort) + **Web Audio API** for sound FX
- **Input:** native **Pointer Events** for drag/trace — no `@dnd-kit`
- **Supabase** (Postgres + Auth) — Phase 2, not first
- **lucide-react** for SVG icons; **`next/font`** for Fredoka + Nunito
- **PWA: Serwist** — Phase 3 (modern successor to `next-pwa` for Next 16 App Router)
- **Vercel** hosting (free tier)
- Testing: **vitest** (unit) + **playwright-bdd** (e2e), mirroring the `lla` setup
- No other dependencies without explicit approval. Prefer fewer libraries.

---

## Build phases (do not start a phase until the prior one works end-to-end)

### Phase 1 — Vertical slice (mock data, no backend)
One theme (**Weather**), all **4 huts**, **Levels 1 + 2 only**, sticker book with 4 + 1 stickers,
per-skill level via a dev toggle. Progress in `localStorage`. **Goal: prove the core loop and the
no-reading bet — playable, hand it to the kids.**

### Phase 2 — Level 3 + second theme + Supabase
Add **Flyer (L3)** mechanics (sentence build, sentence listen). Add a **second theme** with
**interleaving** (30% review). Move themes/items/attempts/stickers to Supabase; add parent auth.

### Phase 3 — Placement, streaks, dashboard, PWA, deploy
3-question **per-skill placement** (parent/teacher adjustable); **streak stickers**; **parent/teacher
dashboard** (per-skill progress + sticker book view); **wordlist source-of-truth import** (Cambridge
YLE); **PWA** (offline audio/image preload, install); deploy to Vercel.

Detailed task breakdown: [`docs/tasks/00-index.md`](docs/tasks/00-index.md). One numbered task per
session.

---

## Design tokens (from spec §8 / module §D)

| Purpose | Hex |
|---|---|
| Surface / page (cream) | `#FFF7ED` |
| Primary (coral) | `#FF6B5E` |
| Accent (teal) | `#2BB3A3` |
| Star / gold | `#FFC53D` |
| Success (green) | `#3FA34D` |
| Text | `#2B2A33` |

- Type: display **Fredoka / Baloo 2** (rounded) for words & headings; body **Nunito**, ≥ 18px;
  **target word ≥ 32px** (tabular numbers for counting). All fg/bg pairs ≥ 4.5:1.
- Spacing: 8px rhythm (8 / 16 / 24 / 32). Card radius 16px; big CTA 22px.
- Target viewport: **portrait tablet ~768×1024**; must also work at 360px width. No pure-white
  child backgrounds; no harsh red anywhere.

---

## Folder structure (target)

```
/src
  /app
    /(child)                              # sticker-book home, island, hut, round screens
    /parent                               # PIN/auth-gated: placement, settings, dashboard (Phase 2+)
  /components
    /ui                                   # AudioButton, ChoiceCard, StickerBadge, ProgressDots, Button
    /game                                 # TabletShell, ScreenHeader, IslandMap, HutCard, StickerBook
    /huts                                 # ListenHut, SpeakHut, ReadHut, WriteHut
    /rewards                              # StickerAward, MasterCelebration
    /parent                               # PinGate, PlacementQuiz, SkillLevelEditor, ProgressView
  /lib
    types.ts                              # ALL shared types
    cn.ts
    speech.ts                             # SpeechSynthesis wrapper (never call .cancel())
    asr.ts                                # SpeechRecognition wrapper + loose match + graceful degrade
    /engine                               # round flow, mastery, scaffold-and-reveal, interleaving
    storage.ts                            # localStorage (P1) → Supabase (P2)
    supabase.ts                           # Phase 2
  /i18n                                   # vi (parent/teacher) + en (content) + index
  /data
    children.ts                           # mock profiles + per-skill levels (dev)
    /themes                               # weather.ts, ... (word lists per level)
/public/icons, manifest.json              # PWA (Phase 3)
/docs/tasks                               # one .md per session
/supabase/migrations                      # Phase 2
```

---

## Coding conventions

- TypeScript strict. **No `any`** — use `unknown` and narrow.
- Function components with explicit `Props` types. Server components by default; `"use client"`
  only when needed (state, audio, animation, browser APIs).
- Tailwind utility classes only. No inline styles, no CSS modules.
- One component per file. `kebab-case.tsx` files, `PascalCase` components.
- No `console.log` in committed code (`console.warn`/`error` sparingly).
- Comments in English; explain **why**, not **what**.
- Update `src/lib/types.ts` for every shared shape. Never duplicate types.
- **Audio:** never call `speechSynthesis.cancel()` (breaks Chrome on macOS — known from `lla`);
  hold-then-advance via `speak(..., { onEnd })`.

---

## Safety rules (always apply)

- **No external links, ads, third-party scripts, or child-tracking analytics** in child mode.
- **Speak / ASR is on-device only — nothing recorded, stored, or transmitted.** This is the privacy
  default; revisit only with explicit instruction.
- **Parent area requires PIN re-entry** when entered from child mode (Phase 1 hardcoded, Phase 2 per
  parent in Supabase).
- **No child names, photos, or progress sent anywhere except Supabase.**
- **Free-tier safe.** No paid APIs/services without asking.

---

## How to work with me in this repo

1. **One task at a time.** I'll point at a single task file. Read it, ask clarifying questions, then
   implement only that task.
2. **Plan before coding.** For any task > ~50 LOC, propose a short plan (files, key decisions) and
   wait for "go."
3. **Mock data in `/src/data/*.ts`** as typed constants. Don't move to Supabase without instruction.
4. **Test on mobile viewport** (Chrome DevTools 768×1024 portrait) — the real target is an iPad.
5. **No new dependencies without asking.** Vanilla preferred.
6. **When unsure, write the boring version first.** Polish and animation come after the kids try it.
7. **At the end of each task**, summarize: files created/modified, what to manually test, anything
   skipped or assumed.

### Deploy workflow (per task)
Branch off `main` → implement → `tsc` + unit + e2e green → PR to `main` → owner reviews/merges →
Vercel preview/deploy. **Never commit directly to `main`.** Commit author email
`nhuythang88@yahoo.com`. Commit trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

## Open questions (track; resolve before the relevant phase)

- Confirm level → age mapping against OLA's actual term structure (affects which themes seed first).
- Confirm sticker-only rewards are enough motivation, or whether a light "avatar dress-up with
  stickers" layer is wanted (Phase 3 candidate).
- Confirm the **wordlist source of truth**: official Cambridge YLE list file vs OLA term lists
  (Phase 3, task 25). Until then, Weather content is hand-seeded from the spec.
- The two children's exact ages and reading level (seeds per-skill placement defaults).
