// Reconcile a theme's taught vocabulary against the Cambridge YLE wordlist
// (task 25). Flags two kinds of misalignment a teacher would care about:
//   - notListed: a word we teach that isn't in the YLE wordlist at all;
//   - belowLevel: a word taught at a level BELOW its YLE level (e.g. a Movers
//     word in the Starter pool).
// Pure + IO-free, so it's unit-tested and can run as a content guard in CI.
import { themeContent } from "@/data/themes/content";
import { yleLevel } from "@/data/wordlist/cambridge-yle";
import type { Level } from "@/lib/types";

const RANK: Record<Level, number> = { starter: 0, mover: 1, flyer: 2 };

export interface BelowLevel {
  word: string;
  taught: Level;
  yle: Level;
}
export interface Reconciliation {
  themeId: string;
  notListed: string[];
  belowLevel: BelowLevel[];
}

// The lowest level whose pool includes the word = the level we first teach it at.
function taughtLevel(themeId: string, word: string): Level {
  const content = themeContent(themeId);
  if (!content) return "flyer";
  if (content.wordsForLevel("starter").some((w) => w.word === word)) return "starter";
  if (content.wordsForLevel("mover").some((w) => w.word === word)) return "mover";
  return "flyer";
}

export function reconcileTheme(themeId: string): Reconciliation {
  const content = themeContent(themeId);
  const notListed: string[] = [];
  const belowLevel: BelowLevel[] = [];
  if (!content) return { themeId, notListed, belowLevel };

  for (const { word } of content.wordsForLevel("flyer")) {
    const yle = yleLevel(word);
    if (!yle) {
      notListed.push(word);
      continue;
    }
    const taught = taughtLevel(themeId, word);
    if (RANK[taught] < RANK[yle]) belowLevel.push({ word, taught, yle });
  }
  return { themeId, notListed, belowLevel };
}
