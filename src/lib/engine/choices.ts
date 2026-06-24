// Choice ordering for a round (engine rule 8).
//
// The correct answer's position is randomized every question so it is never
// learnable as "always the left one". CRITICAL: callers shuffle ONCE per round
// item and keep the result stable across that question's retries (memoize it) —
// options must not jump after a wrong tap, or the scaffold-and-reveal flow
// becomes disorienting. Re-shuffle only when moving to the next question.
//
// SSR NOTE: never call these during a server render (Math.random would make
// server and client HTML differ → hydration mismatch). Shuffle in client state
// after mount (useEffect / an event), which is where the hut engine lives.

// Optional RNG in [0,1) for deterministic tests; defaults to Math.random.
export type Rng = () => number;

// Fisher–Yates, returns a new array (does not mutate the input).
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = out[i] as T;
    const b = out[j] as T;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

// Build the visible options for a round: the correct item plus `count - 1`
// distractors, shuffled so the correct one lands in a random slot. Distractors
// are themselves shuffled before slicing so the wrong options vary too.
export function buildChoices<T>(
  correct: T,
  distractors: readonly T[],
  count: number,
  rng: Rng = Math.random,
): T[] {
  const need = Math.max(0, count - 1);
  const picked = shuffle(distractors, rng).slice(0, need);
  return shuffle([correct, ...picked], rng);
}
