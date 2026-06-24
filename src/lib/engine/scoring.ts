// First-try scoring & mastery (engine rule 9).
//
// Accuracy and mastery count ONLY first-try-correct taps. A correct tap on the
// 2nd choice (or after the scaffold reveals the answer) completes the round but
// does not count — this stops guess-spamming from masquerading as learning.
// `Attempt.firstTryCorrect` is the single source of truth.

import type { Attempt } from "@/lib/types";

// Mastery threshold ≈ 80% (spec §4.6: e.g. 4 of 5 correct).
export const MASTERY_THRESHOLD = 0.8;

// Fraction of attempts answered correctly on the first try, in [0,1].
// Empty input is 0 (nothing demonstrated yet).
export function firstTryAccuracy(attempts: readonly Attempt[]): number {
  if (attempts.length === 0) return 0;
  const correct = attempts.filter((a) => a.firstTryCorrect).length;
  return correct / attempts.length;
}

// Whether a hut's attempts clear the mastery threshold. Below it, the hut offers
// an easier review round rather than blocking (spec §4.6) — that decision lives
// in the engine; this is just the gate.
export function meetsMastery(
  attempts: readonly Attempt[],
  threshold: number = MASTERY_THRESHOLD,
): boolean {
  return attempts.length > 0 && firstTryAccuracy(attempts) >= threshold;
}
