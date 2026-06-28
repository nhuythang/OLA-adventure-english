// Grammar island registry. The island bundles the grammar structures — Plurals +
// Present continuous (emoji-only) and Prepositions (inline-SVG scenes, G2). A
// single hut interleaves items from each structure so a round mixes the grammar
// points (active recall, CLAUDE.md rule 6). The island reuses the whole island→
// hut→sticker loop; the only genuinely new engine piece is buildGrammarQuestions.
import { PLURALS } from "./plurals";
import { PRESENT_CONTINUOUS } from "./present-continuous";
import { PREPOSITIONS } from "./prepositions";
import type { GrammarItem } from "./types";

export const GRAMMAR_THEME_ID = "grammar";

export function isGrammarTheme(themeId: string): boolean {
  return themeId === GRAMMAR_THEME_ID;
}

const STRUCTURES = [PLURALS, PRESENT_CONTINUOUS, PREPOSITIONS];

// Round-robin merge of the structures' items (deterministic — SSR-safe, no RNG;
// choice positions are randomized later, client-side, by the engine). Sliced to
// `rounds`, so an island hut cycles through the grammar points.
export function grammarRoundItems(rounds: number): GrammarItem[] {
  const out: GrammarItem[] = [];
  const max = Math.max(...STRUCTURES.map((s) => s.items.length));
  for (let i = 0; i < max && out.length < rounds; i++) {
    for (const s of STRUCTURES) {
      if (out.length >= rounds) break;
      const item = s.items[i];
      if (item) out.push(item);
    }
  }
  return out;
}
