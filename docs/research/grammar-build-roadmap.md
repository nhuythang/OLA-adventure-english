# Grammar journey — comparison + build roadmap

Synthesizes two research inputs into a concrete plan for adding grammar to **OLA English
Adventure** (ages 4–7 focus). Read alongside [`grammar-yle.md`](grammar-yle.md).

- **A = my in-app research** (`grammar-yle.md`): rate-limited, but the YLE *grammar progression*
  is verified against the official Cambridge 2025 wordlist PDF, and everything is mapped to our
  actual huts/engine.
- **B = the attached "compass" artifact** (`/Users/thangnguyen/Downloads/compass_artifact_…md`):
  comprehensive, cited learning-science + a generic grammar-app design framework (ages 4–15).

## 1. How they compare

**They agree on the core** (high confidence — both, B with citations):
- Grammar for young kids is learned **implicitly, as chunks/patterns, not rules**; minimal
  metalanguage; meaning before form.
- **Spiral/recycling** syllabus; **spaced + interleaved** review; **retrieval practice** beats
  passive review; **no-fail, low-anxiety** practice; **scaffolding within the ZPD**.
- The **Starters→Movers→Flyers progression** (A verified the exact function-word lists; B gives the
  same structures as an age roadmap).
- **Reward mastery, not time**; for under-10s prefer **collection/cooperative** mechanics over
  competitive leaderboards.

**What B adds that A missed** (A was cut short):
- A learning-science spine with citations (Ullman DP model, Pan & Rickard spacing, *Make It Stick*
  interleaving, SDT, Vygotsky ZPD, Cognitive Load → 8–12 min sessions).
- The **Observe → Learn → Apply (OLA)** cycle and a **daily journey** (Goal → mini-story → discover
  → game → speak → spaced review → reward).
- A **50+ activity library** and a **game-mechanics** analysis (streaks/loss-aversion, separate the
  engagement layer from the learning layer).
- **Vietnamese-L1 interference priorities** — the highest-yield targets for VN kids: **articles
  (a/an/the), plural -s, 3rd-person -s, verb tense/inflection, copula "be."** ← very actionable.
- A 1/3/7/14-day **spaced-review schedule** and adaptive (knowledge-tracing) review.

**What A adds that B doesn't:**
- The **exact YLE function-word progression verified from the primary source** (prepositions,
  modals, determiners by level) — concrete content scoping.
- Mapping to **our real architecture** (B is app-agnostic): we already have huts, per-skill levels,
  scaffold-and-reveal, 30% interleaving, streaks, mastery-tied stickers, attempt logging, parent
  dashboard.

**Important correction from B (fact-check):** **"OLA" is NOT "Observe–Learn–Apply."** It's the
brand **"OLA English Language Academy"** (ILA Vietnam's affordable tier, Cambridge/CEFR, play-based/
communicative/project-based). The Observe–Learn–Apply cycle is the artifact author's *synthesized*
framework — a useful coincidental backronym we can adopt internally, but don't claim it's ILA's
official model.

**Reality check — we already implement much of the science:** no-fail + scaffold-and-reveal ≈ ZPD
support and delayed correction; 30% review interleaving ≈ interleaving/spacing; stickers on
mastery ≈ "reward mastery not time"; streaks ≈ habit loop; audio-first/one-task-per-screen ≈
cognitive-load limits; no leaderboards ≈ B's under-10 advice. So the grammar journey is **mostly
content + a small engine extension + an optional "Observe" intro** — not a rebuild.

**Constraints from CLAUDE.md that prune B's suggestions:** no AI / paid APIs in v1 (skip the AI
speaking partner, AI sentence-gen, full Bayesian knowledge tracing → use a simple mastery
heuristic); no leaderboards/competition; DOM + emoji art (our island/hut/master-sticker already =
B's "world map / boss level / collection"); free-tier; solo-maintainable.

## 2. Build roadmap (phased)

### G0 — Decide shape (1 small decision)
**Recommendation:** a dedicated **Grammar island** (it reuses the island→hut→sticker loop and is
visible to kids/parents), then later weave grammar micro-rounds into the vocab themes. Open
question from before — island vs woven — resolves to **island first**.

### G1 — Grammar in the existing engine (MVP, ship first)
The only real new piece: a grammar question's choices are **grammatical contrasts of the same
referent**, not different vocabulary words.
- New `buildGrammarQuestions` (sibling of `buildPictureQuestions`): `{ prompt sentence, correct
  picture, distractor pictures that differ by one grammatical feature }`.
- Reuse **all four huts**, **per-skill levels** (Starter 2–3 choices → Flyer sentence + 4 choices),
  **scaffold-and-reveal**, **interleaving**, **stickers** — no engine rewrite.
- Start with **3 Starters structures**, chosen because they fit no-reading mechanics *and* hit
  Vietnamese pain points:
  1. **Plurals (-s)** — easiest: emoji count (🐱 vs 🐱🐱🐱). "Tap *cats*." (VN omits plurals.)
  2. **Present continuous** — action emoji (🏃🤸🏊). "She is running." → tap the action / build the
     sentence from tiles (our Flyer Write hut already does this).
  3. **Prepositions of place** (in/on/under) — needs **small SVG scenes** (ball + box), the one new
     art need; emoji can't show "under." "The cat is under the table." → tap the scene.
- Reconcile against the YLE grammatical list (we have it in `cambridge-yle.ts`) as a guard.

### G2 — Add the "Observe" front (the OLA cycle)
Our huts are currently "Apply" (produce/recognize). Add a short **Observe** beat before a grammar
hut: ~20–30s of audio + 2–3 patterned picture frames, **no rules** ("one cat… two cats… cats!").
Map the cycle to what we have: **Observe** = new intro; **Learn** = existing scaffold-and-reveal;
**Apply** = the rounds. Small, optional, high pedagogical payoff.

### G3 — Vietnamese-L1 weighting + forgetting-aware review
- Over-weight VN-priority targets (plural -s, 3rd-person -s, copula *be*, articles, tense) in the
  grammar pool.
- We already log `learning_attempts` — use them to drive a **1/3/7/14-day spaced schedule** for the
  review pool (replace random interleaving with "due + weak items first"). No AI needed; a simple
  per-item last-seen + accuracy heuristic.
- Parent dashboard: add a grammar mastery + "common errors" view (we have the dashboard + attempts).

### G4 — Scale up
- Movers/Flyers grammar (past simple, comparatives, going to) via sentence-build + scenes — same
  mechanics, more choices/sentence prompts by level.
- More structures (this/that, can for ability, there is/are).
- Optional later: streak-freeze (loss-aversion mitigation), richer SVG scenes.

## 3. Suggested first task
**G1 with just Plurals + Present continuous** (both emoji-only, zero new art) as a Grammar island
MVP — proves the contrastive-choice engine and the island end-to-end. Add Prepositions (SVG scenes)
in a follow-up. Everything else (G2–G4) is incremental on top.
