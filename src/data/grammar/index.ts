// Grammar island registry. The island bundles the grammar structures — Plurals +
// Present continuous (emoji-only) and Prepositions (inline-SVG scenes, G2). A
// single hut interleaves items from each structure so a round mixes the grammar
// points (active recall, CLAUDE.md rule 6). The island reuses the whole island→
// hut→sticker loop; the only genuinely new engine piece is buildGrammarQuestions.
import { PLURALS } from "./plurals";
import { PRESENT_CONTINUOUS } from "./present-continuous";
import { PREPOSITIONS } from "./prepositions";
import type { GrammarItem, GrammarStructure, ObserveFrame } from "./types";

export const GRAMMAR_THEME_ID = "grammar";

export function isGrammarTheme(themeId: string): boolean {
  return themeId === GRAMMAR_THEME_ID;
}

const STRUCTURES = [PLURALS, PRESENT_CONTINUOUS, PREPOSITIONS];

// The "Observe" beat (G3): each structure's example frames, back to back, shown
// once before a grammar hut's rounds (see ObserveIntro). No rules stated.
export const GRAMMAR_OBSERVE_FRAMES: ObserveFrame[] = STRUCTURES.flatMap((s) => s.observe);

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

// Sliced to `rounds`, so an island hut cycles through the grammar points.
export function grammarRoundItems(rounds: number): GrammarItem[] {
  const pattern = weightedPattern(STRUCTURES);
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
