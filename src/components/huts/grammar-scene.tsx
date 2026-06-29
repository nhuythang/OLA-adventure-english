import type { ReactNode } from "react";
import { relationForKey, type Relation } from "@/data/grammar/scenes";

// Inline-SVG teaching scenes for the prepositions grammar structure. Emoji can
// show a count or an action, but it can't show a spatial relation ("under"), so
// prepositions need drawn scenes: one referent (a ball + a box) in different
// positions. The box is a stroked outline (no fill) so a ball drawn "in" it is
// still visible. Colors come from the theme tokens (Tailwind fill/stroke utils),
// never inline styles. Key↔relation mapping lives in data/grammar/scenes.ts.

const BALL: Record<Relation, { cx: number; cy: number }> = {
  in: { cx: 50, cy: 64 },
  on: { cx: 50, cy: 30 },
  under: { cx: 50, cy: 96 },
  "next to": { cx: 86, cy: 64 },
};

function PrepositionScene({ relation }: { relation: Relation }) {
  const { cx, cy } = BALL[relation];
  return (
    <svg viewBox="0 0 100 110" className="h-full w-full" role="img" aria-hidden focusable="false">
      {/* The box — stroked outline only, so a ball drawn inside stays visible. */}
      <rect x="30" y="44" width="40" height="40" rx="6" className="fill-none stroke-ink" strokeWidth="5" />
      {/* The ball — the moving referent. */}
      <circle cx={cx} cy={cy} r={relation === "under" ? 11 : 13} className="fill-coral" />
    </svg>
  );
}

// Cache the rendered scene element PER KEY so its identity is stable across
// renders — ChoiceCard is memoized, and a fresh element each render would break
// the memo and re-render every sibling card on a single flip (native-feel rule).
// Emoji strings are returned as-is (already stable primitives).
const choiceCache = new Map<string, ReactNode>();

export function resolveChoiceVisual(visual: string): ReactNode {
  const relation = relationForKey(visual);
  if (!relation) return visual; // ordinary emoji string
  if (!choiceCache.has(visual)) {
    choiceCache.set(
      visual,
      <span className="block h-24 w-24">
        <PrepositionScene relation={relation} />
      </span>,
    );
  }
  return choiceCache.get(visual)!;
}

// Larger variant for the single prompt picture in the Speak/Write huts. Identity
// doesn't matter here (one per screen), so it renders fresh.
export function PromptVisual({ visual }: { visual: string }) {
  const relation = relationForKey(visual);
  if (!relation) {
    return (
      <span className="text-7xl" aria-hidden>
        {visual}
      </span>
    );
  }
  return (
    <span className="block h-28 w-28">
      <PrepositionScene relation={relation} />
    </span>
  );
}
