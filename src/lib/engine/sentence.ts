// Pure helpers for the Write hut L3 (build a sentence from word tiles). Mirrors
// spelling.ts but at the word level; kept here so the logic is unit-tested
// without React.
import { shuffle, type Rng } from "./choices";

export interface WordTile {
  id: string;
  word: string;
}

// Tiles the child arranges: every word of the sentence AFTER the first (which is
// shown pre-filled as a hint), shuffled. Ids stay unique so repeated words (and
// the deterministic shuffle) behave.
export function buildWordTiles(words: readonly string[], rng: Rng = Math.random): WordTile[] {
  const rest = words.slice(1);
  return shuffle(rest, rng).map((word, i) => ({ id: `${word}-${i}`, word }));
}

// Slots are the placed words (null = empty). The first slot is the hint.
export function isSentenceComplete(slots: ReadonlyArray<string | null>): boolean {
  return slots.every((s) => s !== null);
}

export function assembled(slots: ReadonlyArray<string | null>): string {
  return slots.map((s) => s ?? "").join(" ");
}

export function isSentenceCorrect(slots: ReadonlyArray<string | null>, words: readonly string[]): boolean {
  return isSentenceComplete(slots) && assembled(slots) === words.join(" ");
}
