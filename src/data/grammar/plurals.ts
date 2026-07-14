// Plurals (regular -s) — the easiest grammar point to teach with no reading:
// emoji COUNT carries the meaning. A BINARY contrast (one 🐱 vs many 🐱🐱🐱) keeps
// the lesson on the -s itself: the plural word means "more than one", full stop —
// not a counting task (which "two vs three" would become). Regular -s only, no
// irregular plurals. Vietnamese omits plural marking, so this is a high-yield
// L1-interference target.
import type { GrammarStructure } from "./types";

interface Noun {
  singular: string;
  plural: string;
  emoji: string;
}

// Order matters: the round builder takes items in order, interleaved with the
// other structure.
const NOUNS: Noun[] = [
  { singular: "cat", plural: "cats", emoji: "🐱" },
  { singular: "dog", plural: "dogs", emoji: "🐶" },
  { singular: "ball", plural: "balls", emoji: "⚽" },
  { singular: "apple", plural: "apples", emoji: "🍎" },
  { singular: "car", plural: "cars", emoji: "🚗" },
  { singular: "star", plural: "stars", emoji: "⭐" },
];

const repeat = (emoji: string, n: number): string => emoji.repeat(n);

export const PLURALS: GrammarStructure = {
  id: "plurals",
  // Vietnamese doesn't mark plurals at all (no -s equivalent) — a high-yield
  // L1-interference target (G5), so this gets a bigger round-share.
  vnFocus: true,
  // No rules — just the pattern, said aloud: one, two, then the bare plural.
  observe: [
    { narration: "One cat.", visual: "🐱" },
    { narration: "Two cats.", visual: "🐱🐱" },
    { narration: "Cats!", visual: "🐱🐱🐱" },
  ],
  items: NOUNS.map((n) => ({
    id: `plurals-${n.singular}`,
    // The bare plural word — "cats" means more than one cat. The only contrast is
    // singular vs plural, so the -s is exactly what distinguishes the answer.
    prompt: n.plural,
    reveal: `This one is ${n.plural}. More than one ${n.singular}!`,
    correct: { id: `${n.singular}-many`, label: n.plural, emoji: repeat(n.emoji, 3) },
    distractors: [{ id: `${n.singular}-one`, label: n.singular, emoji: n.emoji }],
    // "I see cats" — building it puts the plural -s in the child's hands.
    sentenceWords: ["I", "see", n.plural],
    speakTarget: n.plural,
  })),
};
