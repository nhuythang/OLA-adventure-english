// "There is/are" — subject-verb number agreement with a dummy subject, a
// Starters structure (YLE: have got / there is/are / be are all Starters).
// Vietnamese "có" doesn't conjugate for singular/plural — the same gap as
// plurals, so this is another VN-focus target (G5 weighting). Unlike
// plurals.ts (which only ever targets the plural), this alternates BOTH
// directions — "There is a ___" and "There are ___" each get their own item
// — so the child learns "is" pairs with one, "are" with many, not just that
// the plural is always the answer.
import type { Choice } from "@/lib/engine/hut-machine";
import type { GrammarStructure } from "./types";

interface Noun {
  singular: string;
  plural: string;
  emoji: string;
}

const NOUNS: Noun[] = [
  { singular: "flower", plural: "flowers", emoji: "🌸" },
  { singular: "cloud", plural: "clouds", emoji: "☁️" },
  { singular: "book", plural: "books", emoji: "📖" },
  { singular: "balloon", plural: "balloons", emoji: "🎈" },
  { singular: "cookie", plural: "cookies", emoji: "🍪" },
  { singular: "boat", plural: "boats", emoji: "⛵" },
];

const repeat = (emoji: string, n: number): string => emoji.repeat(n);

export const THERE_IS_ARE: GrammarStructure = {
  id: "there-is-are",
  level: "starter",
  vnFocus: true,
  observe: [
    { narration: "There is one flower.", visual: "🌸" },
    { narration: "There are flowers!", visual: "🌸🌸🌸" },
  ],
  items: NOUNS.flatMap((n) => {
    const one: Choice = { id: `${n.singular}-one`, label: `a ${n.singular}`, emoji: n.emoji };
    const many: Choice = { id: `${n.singular}-many`, label: n.plural, emoji: repeat(n.emoji, 3) };
    return [
      {
        id: `there-is-are-${n.singular}-is`,
        prompt: `There is a ${n.singular}.`,
        reveal: `There is one ${n.singular}.`,
        correct: one,
        distractors: [many],
        sentenceWords: ["There", "is", "a", n.singular],
        speakTarget: n.singular,
      },
      {
        id: `there-is-are-${n.singular}-are`,
        prompt: `There are ${n.plural}.`,
        reveal: `There are many ${n.plural}.`,
        correct: many,
        distractors: [one],
        sentenceWords: ["There", "are", n.plural],
        speakTarget: n.plural,
      },
    ];
  }),
};
