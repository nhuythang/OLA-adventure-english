// Builds the round questions for the recognition huts (Listen, Read), mixing in
// review items from mastered themes (active recall, CLAUDE.md rule 6). The Speak
// and Write huts stay current-theme for now (their mechanics don't lend
// themselves to drop-in review without per-round content threading).
import { buildPictureQuestions, type QuestionText } from "@/lib/engine/picture-questions";
import type { EngineQuestion } from "@/lib/engine/hut-machine";
import type { Rng } from "@/lib/engine/choices";
import { interleave } from "@/lib/engine/interleave";
import { themeContent, type ThemeContent } from "@/data/themes/content";
import { reviewPriority, type ItemStats } from "@/lib/progress/review-schedule";
import type { Level } from "@/lib/types";

function questionsFor(content: ThemeContent, level: Level, count: number, rng?: Rng): EngineQuestion[] {
  const text: QuestionText | undefined =
    level === "flyer"
      ? { prompt: (w) => content.sentence(w.word), reveal: (w) => content.reveal(w.word) }
      : undefined;
  return buildPictureQuestions(content.wordsForLevel(level), count, text, rng);
}

// ALL of a theme's questions at a level (no rounds cap) — the candidate pool
// for review scheduling to pick the best few from, not just whichever the
// current-theme rotation would've given.
function allQuestionsFor(content: ThemeContent, level: Level): EngineQuestion[] {
  const pool = content.wordsForLevel(level);
  return questionsFor(content, level, pool.length);
}

// Mastered themes (that have content), excluding the one being played.
export function reviewThemeIds(currentThemeId: string, masteredThemeIds: readonly string[]): string[] {
  return masteredThemeIds.filter((id) => id !== currentThemeId && themeContent(id) !== undefined);
}

// G5: rank review candidates due-and-weak-first (review-schedule.ts) instead
// of whatever order they happened to be built in. `interleave` below takes
// only the front slice it needs, so sorting here is what makes "the ~30%
// review slots go to the most-due items" true.
function rankedReview(
  themeIds: readonly string[],
  level: Level,
  itemStats: ItemStats,
  today: string,
): EngineQuestion[] {
  const candidates = themeIds.flatMap((id) => {
    const content = themeContent(id)!;
    return allQuestionsFor(content, level).map((q) => ({ q, key: `${id}-${q.id}` }));
  });
  candidates.sort((a, b) => reviewPriority(itemStats[b.key], today) - reviewPriority(itemStats[a.key], today));
  return candidates.map((c) => c.q);
}

// Round questions for a picture hut: current theme interleaved with ~30% review
// from mastered themes. Each question keeps its own theme's picture choices, so a
// review round shows that theme's options (tap the lion among other animals).
// Review picks are due-and-weak-first (G5); the current theme's own targets stay
// randomly rotated across the pool (unaffected — see listen-hut.tsx).
export function buildPictureRounds(
  themeId: string,
  masteredThemeIds: readonly string[],
  level: Level,
  rounds: number,
  itemStats: ItemStats = {},
  today: string = "",
  rng?: Rng,
): EngineQuestion[] {
  const content = themeContent(themeId);
  if (!content) return [];
  const current = questionsFor(content, level, rounds, rng);
  const review = rankedReview(reviewThemeIds(themeId, masteredThemeIds), level, itemStats, today);
  return interleave(current, review, rounds);
}
