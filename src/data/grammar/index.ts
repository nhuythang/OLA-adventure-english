// Grammar island registry. The island bundles the grammar structures — Plurals,
// Present continuous, Prepositions (SVG scenes, G2), Can-for-ability, and
// There is/are (G7a) — all Starters-tier so far. A single hut interleaves
// items from each structure so a round mixes the grammar points (active
// recall, CLAUDE.md rule 6). The island reuses the whole island→hut→sticker
// loop; the only genuinely new engine piece is buildGrammarQuestions.
import { PLURALS } from "./plurals";
import { PRESENT_CONTINUOUS } from "./present-continuous";
import { PREPOSITIONS } from "./prepositions";
import { CAN } from "./can";
import { THERE_IS_ARE } from "./there-is-are";
import type { GrammarItem, GrammarStructure, ObserveFrame } from "./types";
import type { Level } from "@/lib/types";

export const GRAMMAR_THEME_ID = "grammar";

export function isGrammarTheme(themeId: string): boolean {
  return themeId === GRAMMAR_THEME_ID;
}

const STRUCTURES = [PLURALS, PRESENT_CONTINUOUS, PREPOSITIONS, CAN, THERE_IS_ARE];

// Stable structure ids (matches each GrammarStructure.id) — the parent
// dashboard (G6) uses this to build its per-structure grammar section without
// hardcoding the list twice.
export type GrammarStructureId = "plurals" | "present-continuous" | "prepositions" | "can" | "there-is-are";
export const GRAMMAR_STRUCTURE_IDS: readonly GrammarStructureId[] = STRUCTURES.map(
  (s) => s.id,
) as GrammarStructureId[];

// Level gating (G7): a child's round pool draws only from structures at or
// below their level, cascading like vocab pools (Starter sees starter-tier,
// Mover sees starter+mover, Flyer sees everything) — otherwise a Movers/
// Flyers-only structure would get taught to a Starter-level 4-year-old.
const RANK: Record<Level, number> = { starter: 0, mover: 1, flyer: 2 };

function structuresForLevel(level: Level): GrammarStructure[] {
  return STRUCTURES.filter((s) => RANK[s.level] <= RANK[level]);
}

// The "Observe" beat (G3): the level-eligible structures' example frames,
// back to back, shown once before a grammar hut's rounds (see ObserveIntro).
// No rules stated.
export function grammarObserveFrames(level: Level): ObserveFrame[] {
  return structuresForLevel(level).flatMap((s) => s.observe);
}

// Weighted round-robin merge of the structures' items (deterministic —
// SSR-safe, no RNG; choice positions are randomized later, client-side, by
// the engine). vnFocus structures (G5) get a bigger round-share — weight 2
// vs 1 — WITHOUT clumping (a naive "repeat the structure" would put two
// plurals rounds back to back, undermining interleaving/rule 6): a weighted
// round-robin schedule spreads a structure's extra turns across separate
// passes instead, e.g. weights {plurals:2, present:2, prepositions:1} builds
// the pattern [plurals, present, prepositions, plurals, present] — every
// structure still alternates with a different one each turn.
function weightOf(s: GrammarStructure): number {
  return s.vnFocus ? 2 : 1;
}

function weightedPattern(structures: readonly GrammarStructure[]): GrammarStructure[] {
  const maxWeight = Math.max(...structures.map(weightOf));
  const pattern: GrammarStructure[] = [];
  for (let pass = 1; pass <= maxWeight; pass++) {
    for (const s of structures) {
      if (weightOf(s) >= pass) pattern.push(s);
    }
  }
  return pattern;
}

// Sliced to `rounds`, so an island hut cycles through the grammar points the
// child's level unlocks.
export function grammarRoundItems(rounds: number, level: Level): GrammarItem[] {
  const pattern = weightedPattern(structuresForLevel(level));
  const cursors = new Map<GrammarStructure, number>();
  const out: GrammarItem[] = [];
  let p = 0;
  // A full pass through the pattern with nothing taken means every
  // structure is exhausted — stop instead of spinning forever.
  let emptyStreak = 0;
  while (out.length < rounds && emptyStreak < pattern.length) {
    const s = pattern[p % pattern.length]!;
    const idx = cursors.get(s) ?? 0;
    const item = s.items[idx];
    if (item) {
      out.push(item);
      cursors.set(s, idx + 1);
      emptyStreak = 0;
    } else {
      emptyStreak++;
    }
    p++;
  }
  return out;
}
