// Present continuous ("She/He is ___ing") — the grammar lives in the heard/read
// sentence form and in building it from tiles. Listen/Read present an action
// scene; the choices are different actions (same person, doing something else),
// so the child maps the -ing verb they hear to the matching action. Verb
// inflection is a high-yield Vietnamese L1-interference target. Emoji-only, no art.
import type { GrammarStructure } from "./types";

interface Action {
  verb: string; // base form, e.g. "run"
  ing: string; // "running"
  emoji: string;
  subject: "She" | "He";
}

const ACTIONS: Action[] = [
  { verb: "run", ing: "running", emoji: "🏃", subject: "She" },
  { verb: "swim", ing: "swimming", emoji: "🏊", subject: "He" },
  { verb: "dance", ing: "dancing", emoji: "💃", subject: "She" },
  { verb: "walk", ing: "walking", emoji: "🚶", subject: "He" },
  { verb: "sleep", ing: "sleeping", emoji: "😴", subject: "She" },
  { verb: "eat", ing: "eating", emoji: "😋", subject: "He" },
];

export const PRESENT_CONTINUOUS: GrammarStructure = {
  id: "present-continuous",
  level: "starter",
  // "is" here is the copula "be" — a high-yield L1-interference target (G5;
  // Vietnamese has no copula in this construction) alongside the -ing verb
  // inflection, so this gets a bigger round-share.
  vnFocus: true,
  // No rules — just two examples of the -ing pattern in action.
  observe: [
    { narration: "She is running.", visual: "🏃" },
    { narration: "He is swimming.", visual: "🏊" },
  ],
  items: ACTIONS.map((a) => {
    const sentence = `${a.subject} is ${a.ing}.`;
    return {
      id: `present-continuous-${a.verb}`,
      prompt: sentence,
      reveal: sentence,
      correct: { id: `${a.verb}-action`, label: a.ing, emoji: a.emoji },
      // Other actions — same sentence frame, different verb (the engine slices
      // these to the level's choice count).
      distractors: ACTIONS.filter((o) => o.verb !== a.verb).map((o) => ({
        id: `${o.verb}-action`,
        label: o.ing,
        emoji: o.emoji,
      })),
      sentenceWords: [a.subject, "is", a.ing],
      speakTarget: a.ing,
    };
  }),
};
