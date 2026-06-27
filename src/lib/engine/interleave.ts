// Deterministic active-recall interleaving (CLAUDE.md rule 6): a session mixes
// ~70% current-theme items with ~30% review items from earlier mastered themes.
// No RNG — placement is a pure function of the lengths, so it's SSR-safe and the
// same on server and client (no hydration mismatch).

// Returns up to `rounds` items: `reviewRatio` of them drawn from `review`
// (capped by what's available), spread evenly among the current-theme items.
// With no review items, returns the first `rounds` current items unchanged.
export function interleave<T>(current: T[], review: T[], rounds: number, reviewRatio = 0.3): T[] {
  const reviewCount = Math.min(review.length, Math.round(rounds * reviewRatio));
  const currentCount = Math.max(0, rounds - reviewCount);
  const cur = current.slice(0, currentCount);
  const rev = review.slice(0, reviewCount);
  if (rev.length === 0) return cur;

  const total = cur.length + rev.length;
  // Evenly spaced slots for the review items, e.g. 2 review of 5 → slots 1 and 3.
  const reviewSlots = new Set(rev.map((_, k) => Math.floor(((k + 0.5) * total) / rev.length)));

  const result: T[] = [];
  let ci = 0;
  let ri = 0;
  for (let i = 0; i < total; i++) {
    if (reviewSlots.has(i) && ri < rev.length) result.push(rev[ri++]!);
    else if (ci < cur.length) result.push(cur[ci++]!);
    else if (ri < rev.length) result.push(rev[ri++]!);
  }
  return result;
}
