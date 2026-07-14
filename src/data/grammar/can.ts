// "can" for ability ("It can fly.") — a Starters modal (YLE: can is Starters;
// could/must/shall/would are Movers+). Like present-continuous, the sentence
// frame ("It can ___.") stays fixed and the choices are different animal+
// ability pairs, so repeated exposure to "can" is the constant while the
// child listens for WHICH ability is named. Emoji-only, no new art.
import type { GrammarStructure } from "./types";

interface Ability {
  animal: string;
  verb: string; // base form, e.g. "fly"
  emoji: string;
}

const ABILITIES: Ability[] = [
  { animal: "bird", verb: "fly", emoji: "🐦" },
  { animal: "fish", verb: "swim", emoji: "🐟" },
  { animal: "frog", verb: "jump", emoji: "🐸" },
  { animal: "monkey", verb: "climb", emoji: "🐒" },
  { animal: "kangaroo", verb: "hop", emoji: "🦘" },
  { animal: "dog", verb: "run", emoji: "🐶" },
];

export const CAN: GrammarStructure = {
  id: "can",
  level: "starter",
  // No rules — the pattern said aloud with two clear examples.
  observe: [
    { narration: "A bird can fly.", visual: "🐦" },
    { narration: "A fish can swim.", visual: "🐟" },
  ],
  items: ABILITIES.map((a) => ({
    id: `can-${a.animal}`,
    prompt: `It can ${a.verb}.`,
    reveal: `The ${a.animal} can ${a.verb}.`,
    correct: { id: `${a.animal}-can`, label: a.animal, emoji: a.emoji },
    // Other animals — same "It can ___." frame, different ability.
    distractors: ABILITIES.filter((o) => o.animal !== a.animal).map((o) => ({
      id: `${o.animal}-can`,
      label: o.animal,
      emoji: o.emoji,
    })),
    sentenceWords: ["It", "can", a.verb],
    speakTarget: a.verb,
  })),
};
