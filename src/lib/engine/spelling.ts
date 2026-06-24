// Pure helpers for the Write hut L2 (spell with letter tiles). Kept here so the
// logic is unit-tested without React.
import { shuffle, type Rng } from "./choices";

export interface Tile {
  id: string;
  letter: string;
}

const FILLER = "abcdefghijklmnopqrstuvwxyz".split("");

// Tiles the child arranges: every letter of the word AFTER the first (which is
// shown pre-filled as a hint) plus `extra` distractor letters not already in
// the word, shuffled. Ids are unique so duplicate letters stay distinct.
export function buildTiles(word: string, extra: number, rng: Rng = Math.random): Tile[] {
  const needed = word.slice(1).split("");
  const used = new Set(word.toLowerCase().split(""));
  const fillers = shuffle(FILLER.filter((c) => !used.has(c)), rng).slice(0, Math.max(0, extra));
  const letters = [...needed, ...fillers];
  return shuffle(letters, rng).map((letter, i) => ({ id: `${letter}-${i}`, letter }));
}

// Slots are the placed letters (null = empty). The first slot is the hint.
export function isComplete(slots: ReadonlyArray<string | null>): boolean {
  return slots.every((s) => s !== null);
}

export function spelled(slots: ReadonlyArray<string | null>): string {
  return slots.map((s) => s ?? "").join("");
}

export function isCorrect(slots: ReadonlyArray<string | null>, word: string): boolean {
  return isComplete(slots) && spelled(slots) === word;
}
