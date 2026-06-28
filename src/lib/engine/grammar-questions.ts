// Builder for grammar rounds — the one new engine piece for the Grammar island.
// Sibling of buildPictureQuestions, but the choices are GRAMMATICAL CONTRASTS of
// the same referent (one cat vs three cats; running vs swimming under the same
// sentence frame), not different vocabulary words. The output is a plain
// EngineQuestion[], so it flows through the existing scaffold-and-reveal state
// machine, random answer position, first-try scoring, mastery and stickers
// unchanged — no engine rewrite (CLAUDE.md rules 3, 8, 9).
import type { EngineQuestion } from "./hut-machine";
import type { GrammarItem } from "@/data/grammar/types";

export function toEngineQuestion(item: GrammarItem): EngineQuestion {
  return {
    id: item.id,
    prompt: item.prompt,
    reveal: item.reveal,
    correct: item.correct,
    distractors: item.distractors,
  };
}

export function buildGrammarQuestions(items: readonly GrammarItem[]): EngineQuestion[] {
  return items.map(toEngineQuestion);
}
