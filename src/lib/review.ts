// Builds the round questions for the recognition huts (Listen, Read), mixing in
// review items from mastered themes (active recall, CLAUDE.md rule 6). The Speak
// and Write huts stay current-theme for now (their mechanics don't lend
// themselves to drop-in review without per-round content threading).
import { buildPictureQuestions, type QuestionText } from "@/lib/engine/picture-questions";
import type { EngineQuestion } from "@/lib/engine/hut-machine";
import type { Rng } from "@/lib/engine/choices";
import { interleave } from "@/lib/engine/interleave";
import { themeContent, type ThemeContent } from "@/data/themes/content";
import type { Level } from "@/lib/types";

function questionsFor(content: ThemeContent, level: Level, count: number, rng?: Rng): EngineQuestion[] {
  const text: QuestionText | undefined =
    level === "flyer"
      ? { prompt: (w) => content.sentence(w.word), reveal: (w) => content.reveal(w.word) }
      : undefined;
  return buildPictureQuestions(content.wordsForLevel(level), count, text, rng);
}

// Mastered themes (that have content), excluding the one being played.
export function reviewThemeIds(currentThemeId: string, masteredThemeIds: readonly string[]): string[] {
  return masteredThemeIds.filter((id) => id !== currentThemeId && themeContent(id) !== undefined);
}

// Round questions for a picture hut: current theme interleaved with ~30% review
// from mastered themes. Each question keeps its own theme's picture choices, so a
// review round shows that theme's options (tap the lion among other animals).
export function buildPictureRounds(
  themeId: string,
  masteredThemeIds: readonly string[],
  level: Level,
  rounds: number,
  rng?: Rng,
): EngineQuestion[] {
  const content = themeContent(themeId);
  if (!content) return [];
  const current = questionsFor(content, level, rounds, rng);
  const review = reviewThemeIds(themeId, masteredThemeIds).flatMap((id) =>
    questionsFor(themeContent(id)!, level, rounds, rng),
  );
  return interleave(current, review, rounds);
}
