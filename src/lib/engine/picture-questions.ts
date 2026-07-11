// Shared builder for "tap the matching picture" questions, used by the Listen
// hut (hear the word) and the Read hut (read the word). The engine question is
// identical for both — only the prompt presentation differs (audio vs printed
// word), which the hut decides.
import type { EngineQuestion } from "./hut-machine";
import { shuffle, type Rng } from "./choices";

export interface PictureWord {
  word: string;
  emoji: string;
}

// Optional prompt/reveal overrides — Flyer (L3) listen/read pose a full sentence
// ("It is sunny today.") instead of the bare word, while the choices stay the
// same scene pictures.
export interface QuestionText {
  prompt?: (w: PictureWord) => string;
  reveal?: (w: PictureWord) => string;
}

// `rng`, when given, samples the round's targets from anywhere in the pool
// instead of always its first N — so a pool bigger than `rounds` (task: deepen
// the vocab islands) actually gets taught over time, not just used as
// distractor filler. Omitted (SSR / tests that don't care) keeps the old
// deterministic first-N order. Never call with an rng during a server render
// (see choices.ts's SSR note) — callers gate this behind useClientReady.
export function buildPictureQuestions(
  words: readonly PictureWord[],
  rounds: number,
  text?: QuestionText,
  rng?: Rng,
): EngineQuestion[] {
  const pool = rng ? shuffle(words, rng) : words;
  return pool.slice(0, rounds).map((target) => ({
    id: target.word,
    prompt: text?.prompt ? text.prompt(target) : target.word,
    reveal: text?.reveal ? text.reveal(target) : `This one is ${target.word}.`,
    correct: { id: target.word, label: target.word, emoji: target.emoji },
    distractors: words
      .filter((w) => w.word !== target.word)
      .map((w) => ({ id: w.word, label: w.word, emoji: w.emoji })),
  }));
}
